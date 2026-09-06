import fs from 'node:fs';
import path from 'node:path';
import type { SecurityFinding, Severity } from '../types/audit.js';

interface StaticRule {
  id: string;
  severity: Severity;
  title: string;
  pattern: RegExp;
  plainExplanation: string;
  remediation: string;
  fileFilter?: (filePath: string) => boolean;
}

export class DeterministicScanner {
  private rules: StaticRule[] = [
    {
      id: 'SEC-001',
      severity: 'CRITICAL',
      title: 'Lộ Khóa API OpenAI / DeepSeek trong mã nguồn',
      pattern: /sk-[a-zA-Z0-9_-]{16,}/g,
      plainExplanation: 'Khóa bí mật dùng để gọi AI bị ghi trực tiếp vào code. Bất kỳ ai xem được mã nguồn đều có thể dùng trộm tài khoản của bạn và tiêu hết tiền của bạn.',
      remediation: 'Chuyển API Key vào tệp .env và đọc qua biến môi trường process.env.DEEPSEEK_API_KEY. Không bao giờ commit key lên GitHub.',
    },
    {
      id: 'SEC-002',
      severity: 'CRITICAL',
      title: 'Lộ GitHub Personal Access Token',
      pattern: /(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{40,})/g,
      plainExplanation: 'Token truy cập tài khoản GitHub bị ghi thẳng vào mã nguồn. Kẻ tấn công có thể xóa toàn bộ mã nguồn hoặc đánh cắp dự án của bạn.',
      remediation: 'Thu hồi (Revoke) token này ngay trên GitHub Settings và đưa vào tệp bí mật .env.',
    },
    {
      id: 'SEC-003',
      severity: 'CRITICAL',
      title: 'Lộ Khóa AWS Access Key ID',
      pattern: /AKIA[0-9A-Z]{16}/g,
      plainExplanation: 'Khóa tài khoản đám mây Amazon AWS bị lộ. Hacker có thể dùng khóa này để tạo máy ảo đào tiền ảo và bạn sẽ nhận hóa đơn hàng ngàn USD.',
      remediation: 'Vô hiệu hóa khóa này trên AWS IAM Console và sử dụng IAM Roles thay vì lưu khóa tĩnh.',
    },
    {
      id: 'SEC-004',
      severity: 'CRITICAL',
      title: 'Lộ Private Key RSA / SSH',
      pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
      plainExplanation: 'Khóa chứng chỉ riêng tư bị lưu trong code. Kẻ xấu có thể giả mạo máy chủ hoặc giải mã toàn bộ dữ liệu người dùng.',
      remediation: 'Xóa ngay tệp chứng chỉ khỏi thư mục dự án và lưu vào kho lưu trữ bí mật (Secret Vault / Server Keychain).',
    },
    {
      id: 'SEC-005',
      severity: 'CRITICAL',
      title: 'Lộ mật khẩu Cơ sở dữ liệu trong chuỗi kết nối',
      pattern: /(postgres|postgresql|mysql|mongodb(\+srv)?):\/\/[a-zA-Z0-9_-]+:[^@\s]+@[a-zA-Z0-9.-]+/g,
      plainExplanation: 'Tài khoản và mật khẩu trực tiếp của Cơ sở dữ liệu bị lộ. Kẻ tấn công có thể tải toàn bộ dữ liệu khách hàng hoặc xóa trắng database.',
      remediation: 'Đưa chuỗi kết nối database vào biến môi trường DATABASE_URL trong tệp .env.',
    },
    {
      id: 'SEC-006',
      severity: 'HIGH',
      title: 'Nguy cơ Tấn công Tiêm mã SQL (SQL Injection)',
      pattern: /(SELECT|INSERT|UPDATE|DELETE|DROP)\s+[^`]*\$\{/gi,
      plainExplanation: 'Ứng dụng đang ghép trực tiếp dữ liệu người dùng nhập vào câu lệnh truy vấn database mà không lọc. Người dùng xấu có thể nhập chuỗi ký tự đặc biệt để xem trộm mật khẩu người khác.',
      remediation: 'Dùng câu lệnh chuẩn bị sẵn (Parameterized Queries / Prepared Statements) hoặc sử dụng ORM như Prisma, Drizzle.',
    },
    {
      id: 'SEC-007',
      severity: 'HIGH',
      title: 'Thực thi mã tùy ý không an toàn (Insecure eval / Function)',
      pattern: /\b(eval|Function)\s*\(\s*[^)]+\)/g,
      plainExplanation: 'Lệnh eval() cho phép chạy bất kỳ đoạn mã văn bản nào như một chương trình. Đây là lỗ hổng nghiêm trọng rất dễ bị chiếm quyền điều khiển.',
      remediation: 'Tuyệt đối tránh sử dụng eval(). Sử dụng JSON.parse() hoặc các giải pháp xử lý logic an toàn thay thế.',
    },
    {
      id: 'SEC-008',
      severity: 'HIGH',
      title: 'Nguy cơ Tấn công XSS qua dangerouslySetInnerHTML / raw innerHTML',
      pattern: /(dangerouslySetInnerHTML\s*=\s*\{|\.innerHTML\s*=)/g,
      plainExplanation: 'Ứng dụng đang hiển thị mã HTML trực tiếp mà chưa qua màng lọc làm sạch (Sanitization). Kẻ tấn công có thể chèn mã JavaScript độc hại để đánh cắp phiên đăng nhập của người dùng khác.',
      remediation: 'Dùng thư viện làm sạch DOMPurify trước khi render, hoặc render văn bản thông thường thay vì mã HTML thô.',
    },
    {
      id: 'SEC-009',
      severity: 'MEDIUM',
      title: 'Lưu trữ thông tin nhạy cảm vào LocalStorage trình duyệt',
      pattern: /localStorage\.setItem\s*\(\s*['"](token|auth|password|jwt|apiKey|api_key)['"]/gi,
      plainExplanation: 'Mã xác thực hoặc mật khẩu đang được lưu ở bộ nhớ trình duyệt (LocalStorage). Các extension độc hại cài trên máy người dùng có thể đọc trộm thông tin này.',
      remediation: 'Lưu session đăng nhập bằng HttpOnly Cookie để trình duyệt tự bảo vệ và JavaScript bên ngoài không thể đọc trộm.',
    },
    {
      id: 'SEC-010',
      severity: 'HIGH',
      title: 'Tắt kiểm tra chứng chỉ bảo mật SSL/TLS (rejectUnauthorized: false)',
      pattern: /rejectUnauthorized\s*:\s*false/g,
      plainExplanation: 'Hệ thống đang bỏ qua việc kiểm tra chứng chỉ an toàn khi kết nối mạng. Dữ liệu gửi đi có thể bị chặn và đọc trộm trên đường truyền (Man-in-the-Middle).',
      remediation: 'Bật kiểm tra chứng chỉ SSL/TLS chuẩn (rejectUnauthorized: true) khi triển khai môi trường thật.',
    },
    {
      id: 'SEC-011',
      severity: 'CRITICAL',
      title: 'Nguy cơ Tiêm mã Lệnh hệ thống (Command Injection)',
      pattern: /(child_process|exec|execSync)\s*\(\s*`[^`]*\$\{/g,
      plainExplanation: 'Hệ thống truyền trực tiếp biến người dùng vào lệnh thực thi dòng lệnh hệ điều hành. Kẻ tấn công có thể gõ lệnh xóa file hoặc cài backdoor.',
      remediation: 'Sử dụng execFile hoặc spawn với mảng tham số riêng biệt thay vì ghép chuỗi vào shell exec.',
    }
  ];

  public scanFiles(targetDir: string, filePaths: string[]): SecurityFinding[] {
    const findings: SecurityFinding[] = [];
    let counter = 1;

    for (const filePath of filePaths) {
      // Bỏ qua các tệp ví dụ mẫu .example hoặc lockfile
      const base = path.basename(filePath);
      if (base.endsWith('.example') || base.endsWith('-lock.yaml') || base === 'package-lock.json') {
        continue;
      }

      let content = '';
      try {
        content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
      } catch {
        continue;
      }

      const lines = content.split('\n');
      const relativePath = path.relative(targetDir, filePath).replace(/\\/g, '/');

      for (const rule of this.rules) {
        if (rule.fileFilter && !rule.fileFilter(filePath)) {
          continue;
        }

        rule.pattern.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = rule.pattern.exec(content)) !== null) {
          // Tính số dòng
          const index = match.index;
          const lineNumber = content.substring(0, index).split('\n').length;
          const matchedLine = lines[lineNumber - 1]?.trim() || '';

          // Mặt nạ che bớt key nhạy cảm khi hiển thị
          const maskedSnippet = this.maskSensitive(matchedLine, match[0]);

          findings.push({
            id: `FINDING-${String(counter++).padStart(3, '0')}`,
            ruleId: rule.id,
            severity: rule.severity,
            title: rule.title,
            file: relativePath,
            line: lineNumber,
            codeSnippet: maskedSnippet,
            plainExplanation: rule.plainExplanation,
            remediation: rule.remediation,
          });

          // Nếu chỉ cần bắt 1 lần cho file để tránh spam
          if (match[0].length > 50) break;
        }
      }
    }

    return findings;
  }

  private maskSensitive(line: string, matchStr: string): string {
    if (matchStr.length <= 8) return line;
    const masked = matchStr.substring(0, 4) + '        ' + matchStr.substring(matchStr.length - 4);
    return line.replace(matchStr, masked);
  }
}
