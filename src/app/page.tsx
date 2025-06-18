import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            AI Image Style Transfer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your images with AI-powered artistic styles using Google&apos;s Gemini 2.0 Flash Preview.
            Upload an image, choose a style, and get stunning results in under 5 seconds.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>🎨 How it works</CardTitle>
              <CardDescription>Simple steps to transform your images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-medium mb-1">Upload Image</h3>
                  <p className="text-sm text-gray-600">Drag & drop or click to upload</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h3 className="font-medium mb-1">Choose Style</h3>
                  <p className="text-sm text-gray-600">Select from preset artistic styles</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h3 className="font-medium mb-1">AI Transform</h3>
                  <p className="text-sm text-gray-600">Watch the magic happen</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <h3 className="font-medium mb-1">Download</h3>
                  <p className="text-sm text-gray-600">Get your styled masterpiece</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/upload">
              <Button size="lg" className="px-8 py-3 text-lg">
                Start Creating →
              </Button>
            </Link>
          </div>

          <div className="mt-12 text-center text-sm text-gray-500">
            <p>Requires your own Gemini API key • Client-side processing • Your data stays private</p>
          </div>
        </div>
      </div>
    </div>
  );
}
