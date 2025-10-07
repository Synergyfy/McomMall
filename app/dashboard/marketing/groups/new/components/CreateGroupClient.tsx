"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateGroup } from "@/service/grouping/hooks";
import { useGetMyMembership } from "@/service/membership/hooks";
import { toast } from "sonner";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreateGroupDto } from "@/service/grouping/types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  localArea: z.string().min(2, "Local area must be at least 2 characters."),
  size: z.enum(["6", "12"]),
  recruitmentDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  pitchUrl: z.string().url().optional(),
});

const CreateGroupClient = () => {
  const { data: membership, isLoading: isLoadingMembership } = useGetMyMembership();
  const createGroup = useCreateGroup();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      localArea: "",
      size: "6",
      recruitmentDeadline: "",
      pitchUrl: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data: CreateGroupDto = {
        ...values,
        size: parseInt(values.size, 10) as 6 | 12,
        recruitmentDeadline: new Date(values.recruitmentDeadline).toISOString(),
    };
    createGroup.mutate(data, {
        onSuccess: () => {
            toast.success("Group created successfully!");
            form.reset();
        },
        onError: (error) => {
            toast.error(`Failed to create group: ${error.message}`);
        }
    });
  };

  if (isLoadingMembership) {
    return <div>Loading membership status...</div>;
  }

  if (membership?.tier !== "PROFESSIONAL") {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Upgrade Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You need to be a Professional member to create a group.
            </p>
            <Button asChild>
              <Link href="/dashboard/marketing/membership">Upgrade Membership</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Local Retail Alliance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="localArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Area</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Shoreditch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Group Size</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="6" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            6 Members
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="12" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            12 Members
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recruitmentDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recruitment Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pitchUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pitch URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/pitch.pdf" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createGroup.isPending}>
                {createGroup.isPending ? "Creating..." : "Create Group"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGroupClient;