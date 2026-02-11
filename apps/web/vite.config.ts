import { defineConfig } from 'vite';
import { spawn } from 'node:child_process';
import * as net from 'node:net';
import * as path from 'node:path';

const isPortOpen = (port: number) => {
  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    const finalize = (open: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(600);
    socket.once('connect', () => finalize(true));
    socket.once('timeout', () => finalize(false));
    socket.once('error', () => finalize(false));
    socket.connect(port, '127.0.0.1');
  });
};

export default defineConfig({
  plugins: [
    {
      name: 'start-backend',
      configureServer() {
        const port = 4080;
        isPortOpen(port).then((open) => {
          if (open) return;
          const backendCwd = path.resolve(__dirname, '../server');
          const child = spawn('npm', ['run', 'dev'], {
            cwd: backendCwd,
            stdio: 'inherit',
            shell: true
          });
          process.on('exit', () => child.kill());
        });
      }
    }
  ],
  server: {
    host: "0.0.0.0",
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:4080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
