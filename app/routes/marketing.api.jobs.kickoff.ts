import { ActionFunction } from "@remix-run/node";

import { handleExpiredSends, handleExpiredSendViews } from "~/jobs";

/**
 * The headers that we expect to be present in the request for kicking off jobs.
 */
export const JOBS_KICKOFF_EXPECTED_HEADERS = {
  JOBS_KICKOFF_AUTH_KEY: "X-2SECURED-JOBS-KICKOFF-AUTH-KEY",
};

/*
Helpful command for testing this route:

curl -X POST http://localhost:5173/marketing/api/jobs/kickoff \
  -H "X-2SECURED-JOBS-KICKOFF-AUTH-KEY: 123456" \
  -i
*/

/**
 * Action for kicking off jobs.
 */
export const action: ActionFunction = async ({ request }) => {
  try {
    const jobsKickoffAuthKey = request.headers.get(JOBS_KICKOFF_EXPECTED_HEADERS.JOBS_KICKOFF_AUTH_KEY);

    console.log(process.env);

    if (!jobsKickoffAuthKey) {
      return new Response("Missing required headers.", { status: 400 });
    }

    if (jobsKickoffAuthKey !== process.env.JOBS_KICKOFF_AUTH_KEY) {
      return new Response("Invalid auth key.", { status: 400 });
    }

    console.log("Kicking off jobs...");

    // just fire them off serially for now
    await handleExpiredSends();
    await handleExpiredSendViews();

    console.log("Jobs completed.");

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};
