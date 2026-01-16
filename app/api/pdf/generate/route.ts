import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.permissions.includes("admin:view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("excelFile") as File;
  // 💡 Hent tittelen fra skjemaet, eller bruk default
  const title = (formData.get("title") as string) || "Dokument";

  if (!file) {
    return NextResponse.json({ error: "Ingen fil lastet opp" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const scriptPath = path.join(process.cwd(), "scripts/pdf-generator", "generate_pdf.py");
  
  // 💡 Send tittelen som argument til python scriptet
  const pythonProcess = spawn("python3", [scriptPath, title]);

  const pdfChunks: Buffer[] = [];
  const errorChunks: Buffer[] = [];

  return new Promise((resolve) => {
    pythonProcess.stdout.on("data", (chunk) => {
      pdfChunks.push(chunk);
    });

    pythonProcess.stderr.on("data", (chunk) => {
      errorChunks.push(chunk);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        const errorMsg = Buffer.concat(errorChunks).toString();
        console.error("Python Script Error:", errorMsg);
        resolve(
          NextResponse.json(
            { error: "Klarte ikke generere PDF.", details: errorMsg },
            { status: 500 }
          )
        );
      } else {
        const pdfBuffer = Buffer.concat(pdfChunks);
        
        // Sanitize title for filename (remove spaces/special chars)
        const safeFilename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${safeFilename}.pdf"`,
            },
          })
        );
      }
    });

    pythonProcess.stdin.write(fileBuffer);
    pythonProcess.stdin.end();
  });
}