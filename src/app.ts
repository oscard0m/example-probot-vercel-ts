import type { Probot, Context } from "probot";

export default (app: Probot) => {
  app.log.info("Yay! The app was loaded!");

  app.on("issues.opened", async (context: Context) => {
    return context.octokit.issues.createComment(
      context.issue({ body: "Hello, World!" })
    );
  });
};
