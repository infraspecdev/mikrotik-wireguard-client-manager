/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const {Client} = require("ssh2");

export const executeSSHCommand = async (
  command: string,
  host: string,
  port: number,
  username: string,
  password: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => {
        conn.exec(command, (err: any, stream: any) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          let stdout = "";
          let stderr = "";

          stream
            .on("close", (code: number) => {
              conn.end();
              if (code === 0) {
                resolve(stdout);  // Return the command output
              } else {
                reject(new Error(stderr));
              }
            })
            .on("data", (data: { toString: () => string }) => {
              stdout += data.toString();
            })
            .stderr.on("data", (data: { toString: () => string }) => {
              stderr += data.toString();
            });
        });
      })
      .on("error", (err: any) => {
        console.error("SSH Error:", err);
        reject(err);
      })
      .connect({
        host,
        port,
        username,
        password,
      });
  });
};
