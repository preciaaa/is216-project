export type MeetgridBookEvent = {
    id?: string;
    name: string | null;
    date: string | null;
    startTime?: number | null;
    endTime?: number | null;
    notes: string | null;
    status: string | null;
    participantId: string | null; 
    eventCode: string | null;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
}