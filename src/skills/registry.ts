import { SKILL_CATALOG_DEFINITIONS } from './catalog-data.js';
import type {
  SkillDefinition,
  SkillCategory,
  SkillState,
  TenantEntitlement,
} from './types.js';

/**
 * SkillRegistry: Quản lý danh mục kỹ năng, trạng thái kích hoạt, kiểm tra phụ thuộc và quyền hạn
 */
export class SkillRegistry {
  private skills: Map<string, SkillDefinition> = new Map();
  private states: Map<string, SkillState> = new Map();

  constructor(customSkills?: SkillDefinition[]) {
    const list = customSkills || SKILL_CATALOG_DEFINITIONS;
    for (const skill of list) {
      this.skills.set(skill.id, skill);
      this.states.set(skill.id, {
        skillId: skill.id,
        enabled: skill.enabledByDefault,
        licensed: skill.category === 'CORE' || skill.category === 'INTERNAL',
        version: skill.version,
        installedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
      });
    }
  }

  /**
   * Lấy thông tin định nghĩa của một Skill theo ID
   */
  public getSkill(id: string): SkillDefinition | undefined {
    return this.skills.get(id);
  }

  /**
   * Lấy trạng thái kích hoạt của Skill
   */
  public getSkillState(id: string): SkillState | undefined {
    return this.states.get(id);
  }

  /**
   * Kiểm tra Skill có đang được bật hay không
   */
  public isSkillEnabled(id: string): boolean {
    return this.states.get(id)?.enabled === true;
  }

  /**
   * Lấy danh sách Skills theo bộ lọc
   */
  public listSkills(filter?: {
    category?: SkillCategory;
    enabledOnly?: boolean;
    agentId?: string;
  }): SkillDefinition[] {
    let result = Array.from(this.skills.values());

    if (filter?.category) {
      result = result.filter(s => s.category === filter.category);
    }

    if (filter?.agentId) {
      result = result.filter(s => s.requiredAgent === filter.agentId);
    }

    if (filter?.enabledOnly) {
      result = result.filter(s => this.isSkillEnabled(s.id));
    }

    return result;
  }

  /**
   * Kích hoạt một Skill (Bảo đảm kiểm tra Entitlement nếu là Premium)
   */
  public enableSkill(id: string, entitlement?: TenantEntitlement): { success: boolean; reason?: string } {
    const skill = this.skills.get(id);
    if (!skill) {
      return { success: false, reason: `Không tìm thấy Skill: ${id}` };
    }

    // Kiểm tra Entitlement đối với Premium Skill
    if (skill.category === 'PREMIUM') {
      const isLicensed = entitlement?.licensedSkillIds.includes(id) ||
        entitlement?.plan === 'ENTERPRISE';

      if (!isLicensed) {
        return {
          success: false,
          reason: `Từ chối kích hoạt: Skill "${skill.name}" yêu cầu gói Premium/Enterprise hoặc mua rời từ Skill Store.`,
        };
      }
    }

    // Kiểm tra tất cả dependencies bắt buộc phải được kích hoạt trước
    for (const dep of skill.dependencies) {
      if (!dep.optional && !this.isSkillEnabled(dep.skillId)) {
        return {
          success: false,
          reason: `Không thể kích hoạt "${skill.name}" vì phụ thuộc bắt buộc "${dep.skillId}" chưa được bật.`,
        };
      }
    }

    const state = this.states.get(id);
    if (state) {
      state.enabled = true;
      state.updatedAt = new Date().toISOString();
    }

    return { success: true };
  }

  /**
   * Tắt một Skill (Ngăn chặn việc tắt các Core Skills bắt buộc của hệ thống)
   */
  public disableSkill(id: string): { success: boolean; reason?: string } {
    const skill = this.skills.get(id);
    if (!skill) {
      return { success: false, reason: `Không tìm thấy Skill: ${id}` };
    }

    if (skill.category === 'CORE' || skill.category === 'INTERNAL') {
      return {
        success: false,
        reason: `Quy tắc bảo vệ: Không thể vô hiệu hóa ${skill.category} Skill "${skill.name}" vì đây là năng lực nền tảng bắt buộc.`,
      };
    }

    // Kiểm tra xem có Skill nào khác đang phụ thuộc vào skill này không
    for (const other of this.skills.values()) {
      if (this.isSkillEnabled(other.id)) {
        const hasDep = other.dependencies.some(d => d.skillId === id && !d.optional);
        if (hasDep) {
          return {
            success: false,
            reason: `Không thể tắt "${skill.name}" vì Skill "${other.name}" đang hoạt động và phụ thuộc vào nó.`,
          };
        }
      }
    }

    const state = this.states.get(id);
    if (state) {
      state.enabled = false;
      state.updatedAt = new Date().toISOString();
    }

    return { success: true };
  }

  /**
   * Ghi nhận lượt thực thi của Skill để thống kê chi phí/tần suất
   */
  public recordExecution(id: string): void {
    const state = this.states.get(id);
    if (state) {
      state.executionCount += 1;
      state.lastExecutedAt = new Date().toISOString();
    }
  }

  /**
   * Thuật toán giải quyết thứ tự phụ thuộc (Topological Sort)
   * Trả về danh sách Skill ID theo thứ tự thực thi an toàn
   */
  public resolveDependencies(skillId: string): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const dfs = (currentId: string) => {
      if (visiting.has(currentId)) {
        throw new Error(`Phát hiện vòng lặp phụ thuộc (Circular Dependency) liên quan tới Skill: ${currentId}`);
      }
      if (visited.has(currentId)) return;

      visiting.add(currentId);
      const skill = this.skills.get(currentId);
      if (skill) {
        for (const dep of skill.dependencies) {
          dfs(dep.skillId);
        }
      }
      visiting.delete(currentId);
      visited.add(currentId);
      result.push(currentId);
    };

    dfs(skillId);
    return result;
  }

  /**
   * Quét kiểm tra toàn bộ đồ thị để đảm bảo không có vòng lặp phụ thuộc (Circular Dependency Prevention)
   */
  public checkCircularDependencies(): { hasCycle: boolean; cycleSkillId?: string } {
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const dfs = (currentId: string): boolean => {
      if (visiting.has(currentId)) return true; // Found cycle!
      if (visited.has(currentId)) return false;

      visiting.add(currentId);
      const skill = this.skills.get(currentId);
      if (skill) {
        for (const dep of skill.dependencies) {
          if (dfs(dep.skillId)) return true;
        }
      }
      visiting.delete(currentId);
      visited.add(currentId);
      return false;
    };

    for (const skillId of this.skills.keys()) {
      if (!visited.has(skillId)) {
        if (dfs(skillId)) {
          return { hasCycle: true, cycleSkillId: skillId };
        }
      }
    }

    return { hasCycle: false };
  }
}

export const defaultSkillRegistry = new SkillRegistry();
