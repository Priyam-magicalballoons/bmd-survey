"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Shield, Users } from "lucide-react";
import { AuthenticateUser, saveUser } from "@/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [campId, setCampId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [id, setId] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await AuthenticateUser(campId);
    if (response.status === 400) {
      setIsLoading(false);
      return toast(response.message, {
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });
    }
    setIsLoading(false);
    const data = JSON.parse(response.message);
    setAddress(data.address);
    setId(data.id);
    // toast(response.message, {
    //   duration: 2000,
    //   position: "top-center",
    //   style: {
    //     backgroundColor: "#f0fdf4",
    //     color: "#166534",
    //     borderColor: "#bbf7d0",
    //   },
    // });
    // return router.push("/Osteocare-Bone-Health-Survey/");
  };

  const handleConfirm = async () => {
    const response = await saveUser(id, campId);
    if (response.status === 400) {
      setIsLoading(false);
      return toast(response.message, {
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });
    } else {
      setIsLoading(false);
      toast(response.message, {
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#f0fdf4",
          color: "#166534",
          borderColor: "#bbf7d0",
        },
      });
      return router.push("/Osteocare-Bone-Health-Survey/");
    }
  };

  return (
    <div
      className={`flex items-center justify-center h-screen flex-col gap-20`}
    >
      <div>
        <div className="rounded-tl-2xl rounded-tr-2xl w-80 bg-white shadow-[0px_10px_2px_1px_rgba(0,_0,_0,_0.1)] pb-10">
          <div className="bg-[#143975] h-18 rounded-tl-2xl rounded-tr-2xl text-white items-center flex justify-center text-2xl font-arial">
            LOGIN
          </div>
          <div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2 w-full flex items-center flex-col px-10 py-10">
                <Label
                  htmlFor="username"
                  className="text-center py-2 text-xl font-arial"
                >
                  ENTER CAMP ID
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder=""
                  value={campId}
                  onChange={(e) => {
                    setAddress("");
                    setCampId(e.target.value);
                  }}
                  required
                  className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none"
                />
              </div>
              <div className="w-full flex items-center justify-center">
                <Button
                  type="submit"
                  className="w-56 rounded-full bg-white text-[#1693dc] shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.5)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-white border border-gray-200 font-arial"
                  disabled={isLoading}
                  hidden={!!address}
                >
                  {isLoading ? "SUBMITTING..." : "SUBMIT"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {address && (
        <div className="w-full flex items-center flex-col">
          <p className="text-center pb-3">LOCATION</p>
          <div className="bg-white w-80 border rounded-xl text-sm text-center p-3">
            {address}
          </div>
          <Button
            onClick={handleConfirm}
            className="w-56 rounded-full bg-white text-[#1693dc] shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.5)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-white border border-gray-200 font-arial mt-5"
          >
            Confirm
          </Button>
        </div>
      )}

      {/* <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              BMD Camp Survey
            </h1>
            <p className="text-muted-foreground mt-2">
              Bone Health Screening Platform
            </p>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the survey platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  className="bg-input border-border"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-2">
            <Shield className="h-6 w-6 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Secure Platform</p>
          </div>
          <div className="space-y-2">
            <Users className="h-6 w-6 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Multi-User Support</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
