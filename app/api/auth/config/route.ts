export async function GET() {
  return Response.json({
    allowRegistration: process.env.ALLOW_REGISTRATION !== "false",
  });
}
