import crowdin, { type Credentials } from "@crowdin/crowdin-api-client";

export const TOKEN = import.meta.env.CROWDIN_API_TOKEN;

// credentials
const credentials: Credentials = {
  token: TOKEN,
};

const { translationStatusApi } = new crowdin(credentials);
// const { translationStatusApi } = new (crowdin as any).default(credentials);

export { translationStatusApi };
