import { LinkPreview } from "@/components/ui/link-preview"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center">
          <p className="text-sm">
            Created by{" "}
            <LinkPreview 
              url="https://github.com/System625"              
            >
              <span className="text-[#7b3b4b] hover:underline font-mono font-bold">System625</span>
            </LinkPreview>
          </p>
        </div>
      </div>
    </footer>
  )
}
