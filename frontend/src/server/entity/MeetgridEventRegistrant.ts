export type MeetgridEventRegistrant = {
    id?: string,
    eventId: string,
    participantName: string,
    interviewerEmail: string,
    participantEmail: string,
    timeslotIdx: number,
    dayIdx: number,
    zoomLink: string,
    backgroundColor: string;
    borderColor: string;
    textColor: string;
}