#!/usr/bin/env node
import { McpServer } from './server.js';

const server = new McpServer();
server.start();
