import http from "http";

export const getRequest = <param>(req: http.IncomingMessage): Promise<param> => {
  return new Promise<param>((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {body += chunk});
    req.on("end", () => {
      try {
        const parse=JSON.parse(body) as param;
        resolve(parse);
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", (err)=> {
      reject(err);
    });
  });
};
