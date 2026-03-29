import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RequestAccessPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Request Account Access</CardTitle>
        <CardDescription>
          Contact us to get started with expense tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">How it works</h3>
            <p className="text-sm text-muted-foreground">
              We create custom accounts for each business. Contact us with your
              business details, and we'll set up your account and send you login
              credentials.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <a
                  href="mailto:tonyr4311@gmail.com"
                  className="text-sm text-primary hover:underline"
                >
                  tonyr4311@gmail.com
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Phone</p>
                <a
                  href="https://wa.me/+918900475063"
                  className="text-sm text-primary hover:underline"
                  target="_blank"
                >
                  +91 8900475063
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  Available worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 px-6 py-4">
        <Button asChild className="w-full">
          <a href="mailto:tonyr4311@gmail.com">Send us an Email</a>
        </Button>
        <div className="text-center text-sm">
          Already have an account?&nbsp;
          <Link
            to="/login"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
