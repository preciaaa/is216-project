"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { MeetgridEvent } from "@/server/entity/MeetgridEvent";
import { MeetgridEventParticipant } from "@/server/entity/MeetgridEventParticipant";
import { MeetgridEventRegistrant } from "@/server/entity/MeetgridEventRegistrant";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    email: z.string().email("This is not a valid email"),
    participantName: z.string().min(1, "Name is required"),
})

interface RegisterEventFormProps {
    mergedAvailability: {[key: string]: string}[][];
    event: MeetgridEvent
    timeslotIdx: number;
    dayIdx: number;
}

export function RegisterForTimeslotForm({ mergedAvailability, timeslotIdx, dayIdx, event }: RegisterEventFormProps) {

    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema)
    });

    function formatDateToISOString(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
                let eventParticipantEmailToFind = "";
                for (const key in mergedAvailability[timeslotIdx][dayIdx]) {
                    if (mergedAvailability[timeslotIdx][dayIdx][key] != "") continue;
                    mergedAvailability[timeslotIdx][dayIdx][key] = values.email;
                    eventParticipantEmailToFind = key;
                    break;
                }

                console.log(eventParticipantEmailToFind)

                //find the guy
                const targetUserResponse = await fetch("/api/user?" + new URLSearchParams({
                    email: eventParticipantEmailToFind
                }));

                const { targetUser } = await targetUserResponse.json();

                // find the guys availability;
                const eventParticipantResponse = await fetch("/api/eventParticipant?" + new URLSearchParams({
                    eventId: event.id!,
                    userId: targetUser.clerkUserId
                }))
                const { eventParticipants } = await eventParticipantResponse.json()

                if (eventParticipantEmailToFind == values.email) {
                    toast({
                        title: "Unable to register for event",
                        description: "Same user account register for the same event",
                        className: "bg-red-500 text-black",
                    })
                    setIsLoading(false);
                    router.push(pathname);

                } else {        
                    // update the guys availability
                    const eventParticipantToUpdate: MeetgridEventParticipant = eventParticipants[0];
                    const eventParticipantToUpdateAvailability = JSON.parse(eventParticipantToUpdate.availabilityString);
                    eventParticipantToUpdateAvailability[timeslotIdx][dayIdx][eventParticipantEmailToFind] = values.email;
                    eventParticipantToUpdate.availabilityString = JSON.stringify(eventParticipantToUpdateAvailability)

                    const eventParticipantToUpdateResponse = await fetch("/api/eventParticipant", {
                        method: "PUT",
                        body: JSON.stringify(eventParticipantToUpdate)
                    })
                    console.log(await eventParticipantToUpdateResponse.json());
                    
                    // todo generate zoom code and email
                    const eventStartDate = new Date(event.startDate);
                    eventStartDate.setDate(eventStartDate.getDate() + dayIdx);
                    eventStartDate.setMinutes(eventStartDate.getMinutes() + timeslotIdx*30)
                    const createZoomMeetingResponse = await fetch("/api/zoom", {
                        method: "POST",
                        body: JSON.stringify({
                            agenda: "Interview",
                            topic: event.name,
                            duration: 30,
                            startDateTime: formatDateToISOString(eventStartDate),
                        })
                    })
                    const { createdMeeting } = await createZoomMeetingResponse.json()

                    // create new event registrant at with that timeslot
                    const eventRegistrantToCreate = {
                        interviewerEmail: eventParticipantEmailToFind,
                        participantName: values.participantName,
                        participantEmail: values.email,
                        eventId: event.id,
                        timeslotIdx: timeslotIdx,
                        dayIdx: dayIdx,
                        zoomLink: createdMeeting.start_url
                    } as MeetgridEventRegistrant

                    // record the info in db
                    const createdEventRegistrantResponse = await fetch("/api/eventRegistrant", {
                        method: "POST",
                        body: JSON.stringify(eventRegistrantToCreate),
                    })
                    console.log(await createdEventRegistrantResponse.json())

                    toast({
                        title: "Successfully Registered for event",
                        description: "You will receive an email with the details of the meeting",
                        className: "bg-green-500 text-black",
                    })
                }

            } catch (error) {
            console.error("Error during registration:", error);
            toast({
                title: "Error",
                description: "There was an issue with your registration. Please try again.",
                className: "bg-red-500 text-black",
        });
    } finally {
        setIsLoading(false);
        router.push(pathname);
        router.refresh();
    }

    } 
    return(
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="participantName"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Enter your name here" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Enter email here" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        { 
                            !isLoading ? 
                                <Button type="submit" className="col-span-2 bg-coral text-black hover:bg-coral/70">
                                    Submit
                                </Button>
                            :
                                <Button disabled className="col-span-2 bg-coral text-black hover:bg-coral/70">
                                    <Loader2 className="animate-spin"/>
                                    Please wait
                                </Button>
                        }
                </form>
            </Form>
    )
}