import { NextRequest, NextResponse } from "next/server";

const ALLOWED_CHANNELS = ["twitter", "linkedin"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, channels } = body;
    const requestedChannels =
      Array.isArray(channels) && channels.length > 0
        ? channels.filter((channel: string) => ALLOWED_CHANNELS.includes(channel))
        : [];

    if (!title || !content || requestedChannels.length === 0) {
      return NextResponse.json(
        { status: "ERROR", message: "Missing title, content, or valid channels." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: "SUCCESS",
      distributedTo: requestedChannels,
      message: `Dispatched Live to ${requestedChannels.join(" and ")}!`,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "ERROR", message: "Unable to parse request body." },
      { status: 400 }
    );
  }
}
