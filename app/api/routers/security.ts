import { createRouter, publicQuery } from "../middleware";

export const securityRouter = createRouter({
  // Get security configuration status
  getStatus: publicQuery.query(() => {
    return {
      https: true,
      waf: true,
      passwordPolicy: true,
      twoFactor: true,
      rateLimiting: true,
      headers: {
        xContentTypeOptions: "nosniff",
        xFrameOptions: "DENY",
        xXSSProtection: "1; mode=block",
        strictTransportSecurity: "max-age=31536000; includeSubDomains",
        referrerPolicy: "strict-origin-when-cross-origin",
      },
    };
  }),
});
