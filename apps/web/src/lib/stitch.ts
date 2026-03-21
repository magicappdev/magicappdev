const STITCH_PROJECT_STORAGE_KEY = "magicappdev:stitch-project-id";
const STITCH_PROJECT_TITLE = "MagicAppDev Starter Screens";
const STITCH_FALLBACK_ACCESS_TOKEN = "unused";
const STITCH_FALLBACK_PROJECT_ID = "unused";

export interface StitchStarterScreen {
  projectId: string;
  screenId: string;
  prompt: string;
  htmlUrl: string;
  imageUrl: string;
}

const getStitchApiKey = () => {
  const apiKey = import.meta.env.VITE_STITCH_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Stitch is not configured for this environment.");
  }

  return apiKey;
};

export const isStitchConfigured = () =>
  Boolean(import.meta.env.VITE_STITCH_API_KEY?.trim());

export async function generateStitchStarterScreen(
  prompt: string,
): Promise<StitchStarterScreen> {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error("Add a prompt before generating with Stitch.");
  }

  const apiKey = getStitchApiKey();
  const { Stitch, StitchError, StitchToolClient } =
    await import("@google/stitch-sdk");

  const client = new StitchToolClient({
    apiKey,
    accessToken: STITCH_FALLBACK_ACCESS_TOKEN,
    projectId: STITCH_FALLBACK_PROJECT_ID,
  });

  try {
    const sdk = new Stitch(client);
    const createProject = async () => {
      const project = await sdk.createProject(STITCH_PROJECT_TITLE);
      window.localStorage.setItem(
        STITCH_PROJECT_STORAGE_KEY,
        project.projectId,
      );
      return project;
    };
    const buildStarterScreen = async (
      projectId: string,
    ): Promise<StitchStarterScreen> => {
      const project = sdk.project(projectId);
      const screen = await project.generate(normalizedPrompt, "DESKTOP");
      const [htmlUrl, imageUrl] = await Promise.all([
        screen.getHtml(),
        screen.getImage(),
      ]);

      return {
        projectId,
        screenId: screen.screenId,
        prompt: normalizedPrompt,
        htmlUrl,
        imageUrl,
      };
    };

    const storedProjectId = window.localStorage.getItem(
      STITCH_PROJECT_STORAGE_KEY,
    );

    if (!storedProjectId) {
      const project = await createProject();
      return buildStarterScreen(project.projectId);
    }

    try {
      return await buildStarterScreen(storedProjectId);
    } catch (error) {
      if (
        error instanceof StitchError &&
        (error.code === "NOT_FOUND" || error.code === "PERMISSION_DENIED")
      ) {
        window.localStorage.removeItem(STITCH_PROJECT_STORAGE_KEY);
        const project = await createProject();
        return buildStarterScreen(project.projectId);
      }

      throw error;
    }
  } finally {
    await client.close();
  }
}
