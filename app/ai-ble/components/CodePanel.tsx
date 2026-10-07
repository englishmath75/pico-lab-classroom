import { useState } from "react";
import { Button } from "@/components/ui/button";
export function CodePanel({
  title,
  language,
  content,
  downloadUrl,
  targetLocation,
}: {
  title: string;
  language: string;
  content: string;
  downloadUrl: string;
  targetLocation: string;
}) {
  const [message, setMessage] = useState("");
  return (
    <details>
      <summary>
        {title} · {targetLocation}
      </summary>
      <p>{language} · 내려받기와 표시 코드는 동일 원본입니다.</p>
      <div className="flex flex-wrap gap-3 my-3">
        <Button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(content);
              setMessage("복사했습니다.");
            } catch {
              setMessage("복사 권한이 없습니다. 원본을 내려받으세요.");
            }
          }}
        >
          코드 복사
        </Button>
        <Button asChild variant="outline">
          <a href={downloadUrl} download>
            원본 내려받기
          </a>
        </Button>
        <span role="status">{message}</span>
      </div>
      <pre>
        <code>{content}</code>
      </pre>
    </details>
  );
}
