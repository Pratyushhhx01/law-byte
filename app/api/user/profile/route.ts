import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME || "lawbite-app-storage";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const avatar = formData.get("avatar") as File | null;

    let imageUrl: string | undefined;

    if (avatar && avatar.size > 0) {
      const bytes = await avatar.arrayBuffer();
      const ext = avatar.name.split(".").pop() || "jpg";
      const key = `avatars/${session.user.id}.${ext}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: Buffer.from(bytes),
          ContentType: avatar.type,
        })
      );

      imageUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${key}`;
    }

    const updateData: Record<string, string> = {};
    if (name !== null && name !== undefined) updateData.name = name;
    if (imageUrl) updateData.image = imageUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await auth.api.updateUser({
      body: updateData,
      headers: request.headers,
    });

    return NextResponse.json({
      user: {
        name: updateData.name ?? session.user.name,
        image: updateData.image ?? session.user.image,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
