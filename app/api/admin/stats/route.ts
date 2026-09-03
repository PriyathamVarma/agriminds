import { NextResponse } from "next/server";
import { connectToDatabase } from "@/shared/lib/mongodb";
import { Chapter } from "@/shared/models/chapter";
import { ChapterApplication } from "@/shared/models/chapterApplication";
import { RequirementSubmission } from "@/shared/models/requirementSubmission";
import { ChapterRequirement } from "@/shared/models/chapterRequirement";
import { ImpactReport } from "@/shared/models/impactReport";
import { requireApiRole } from "@/shared/lib/auth/rbac";

export async function GET() {
  const auth = await requireApiRole(["super_admin"]);
  if ("response" in auth) return auth.response;

  await connectToDatabase();

  const [statusCounts, pendingApplications, pendingSubmissions, overdueRequirements, impactAgg] = await Promise.all([
    Chapter.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ChapterApplication.countDocuments({ status: "pending" }),
    RequirementSubmission.countDocuments({ status: "pending" }),
    ChapterRequirement.countDocuments({ dueDate: { $lt: new Date() }, status: { $nin: ["approved"] } }),
    ImpactReport.aggregate([
      {
        $group: {
          _id: null,
          eventsConducted: { $sum: "$metrics.eventsConducted" },
          farmersReached: { $sum: "$metrics.farmersReached" },
          fpoSupported: { $sum: "$metrics.fpoSupported" },
          startupsSupported: { $sum: "$metrics.startupsSupported" },
          studentsEngaged: { $sum: "$metrics.studentsEngaged" },
          womenEntrepreneursSupported: { $sum: "$metrics.womenEntrepreneursSupported" },
          partnershipsCreated: { $sum: "$metrics.partnershipsCreated" },
          mentorshipSessions: { $sum: "$metrics.mentorshipSessions" },
          fundingFacilitated: { $sum: "$metrics.fundingFacilitated" },
          jobsCreated: { $sum: "$metrics.jobsCreated" },
        },
      },
    ]),
  ]);

  const counts: Record<string, number> = { pending: 0, active: 0, suspended: 0, archived: 0 };
  for (const row of statusCounts as { _id: string; count: number }[]) {
    counts[row._id] = row.count;
  }
  const totalChapters = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return NextResponse.json({
    chapters: { total: totalChapters, ...counts },
    pendingApplications,
    pendingSubmissions,
    overdueRequirements,
    impact: impactAgg[0] || {
      eventsConducted: 0,
      farmersReached: 0,
      fpoSupported: 0,
      startupsSupported: 0,
      studentsEngaged: 0,
      womenEntrepreneursSupported: 0,
      partnershipsCreated: 0,
      mentorshipSessions: 0,
      fundingFacilitated: 0,
      jobsCreated: 0,
    },
  });
}
