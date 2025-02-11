import { MeetgridEventController } from "@/server/controller/MeetgridEventController";
import { NextRequest } from "next/server";

const meetgridEventController: MeetgridEventController = new MeetgridEventController();

export async function GET(request: NextRequest) {
    return await meetgridEventController.find(request);
}

export async function POST(request: NextRequest) {
    return await meetgridEventController.save(request);
}

export async function PUT(request: NextRequest) {
    return await meetgridEventController.update(request);
}

export async function DELETE(request: NextRequest) {
    return await meetgridEventController.delete(request);
}