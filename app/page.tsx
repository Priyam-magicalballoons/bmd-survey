"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Users,
  FileText,
  LogOut,
  User,
  Plus,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutUser } from "@/actions/auth";
import { findDoctor } from "@/actions/doctor";

export default function Dashboard() {
  const [campId, setCampId] = useState("");

  const router = useRouter();

  const handleAddDoctor = () => {
    window.location.href = "/add-doctor";
  };

  const handleReports = () => {
    window.location.href = "/reports";
  };

  return (
    <div className="min-h-screen flex items-center justify-center pb-2 md:pb-32">
      <div className="flex flex-col gap-12">
        <div className="w-full flex items-center justify-center">
          <p className="text-center w-1/2 bg-white text-[#1693dc] text-xl font-semibold px-10 py-3 rounded-2xl">
            HOME
          </p>
        </div>
        <div className="flex-col md:flex-row flex gap-10">
          <Button
            className="text-2xl md:text-4xl px-16 max-w-80 min-w-80 py-20 md:py-24 rounded-2xl bg-[#185eb2] hover:bg-[#003a99]"
            onClick={() => router.push("/start-survey")}
          >
            START CAMP
          </Button>
          <Button className="text-2xl md:text-4xl max-w-80 min-w-80 py-20 md:py-24 rounded-2xl bg-[#143975] hover:bg-[#102060]">
            COMPLETE CAMP
          </Button>
        </div>
      </div>
      {/* Header */}
      {/* <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full justify-between">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-0 sm:h-16  space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 md:w-1/2 sm:space-x-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                    BMD Camp Survey
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Coordinator Dashboard
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={LogoutUser}
                className="flex-1 flex md:hidden text-xs sm:text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Logout</span>
                <span className="xs:hidden">Out</span>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 md:justify-between justify-center ">
              <div className="flex items-center justify-center sm:justify-start space-x-2 bg-primary/5 px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg border border-primary/20">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <div className="text-xs sm:text-sm min-w-0">
                  <span className="text-muted-foreground">Camp ID:</span>
                  <span className="ml-1 font-semibold text-primary truncate">
                    {campId}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                {isDoctorSetup && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReports}
                    className="flex-1 sm:flex-none bg-transparent text-xs sm:text-sm"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Reports</span>
                    <span className="xs:hidden">Rep</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={LogoutUser}
                  className="flex- hidden md:flex text-xs sm:text-sm"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Logout</span>
                  <span className="xs:hidden">Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      {/* <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
       
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome to BMD Camp Survey
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              {!isDoctorSetup
                ? "Please add your assigned doctor to begin conducting bone health screenings."
                : "Conduct bone health screenings and manage patient surveys for your assigned doctor."}
            </p>
          </div>

          {!isDoctorSetup ? (
            
            <Card className="border-border/50 hover:shadow-lg transition-shadow mx-2 sm:mx-0">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl">
                      Setup Required
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Add your assigned doctor to begin the survey process
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleAddDoctor}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
                >
                  Add Assigned Doctor
                </Button>
              </CardContent>
            </Card>
          ) : (
            
            <>
              <Card className="border-border/50 bg-primary/5 mx-2 sm:mx-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl">
                        Assigned Doctor
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Your designated doctor for this survey session
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {assignedDoctor && (
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-base sm:text-lg font-semibold text-foreground truncate">
                        {assignedDoctor.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        MSL Code: {assignedDoctor.mslCode}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card className="border-border/50 hover:shadow-lg transition-shadow mx-2 sm:mx-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-secondary/10 p-2 rounded-lg">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl">
                        Start Patient Survey
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Begin bone health screening for a new patient
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleStartSurvey}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
                  >
                    Add New Patient
                  </Button>
                </CardContent>
              </Card>

             
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mx-2 sm:mx-0">
                <Card className="text-center">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="text-xl sm:text-2xl font-bold text-primary">
                      24
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Completed Surveys
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="text-xl sm:text-2xl font-bold text-secondary">
                      12
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Today's Surveys
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="text-xl sm:text-2xl font-bold text-accent">
                      3
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Active Sessions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main> */}
    </div>
  );
}
