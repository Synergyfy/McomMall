'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Upload, Video, FileText, PlayCircle } from 'lucide-react';

export default function TrainingPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Training Hub</h1>
                    <p className="text-slate-500">Educational resources for sellers and providers</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resource
                </Button>
            </div>

            <Tabs defaultValue="courses" className="space-y-6">
                <TabsList className="bg-white border p-1">
                    <TabsTrigger value="courses" className="gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Courses
                    </TabsTrigger>
                    <TabsTrigger value="webinars" className="gap-2">
                        <Video className="h-4 w-4" />
                        Webinars
                    </TabsTrigger>
                    <TabsTrigger value="docs" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Documentation
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="courses">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: 'Seller Onboarding 101', duration: '45m', students: 1205 },
                            { title: 'Optimizing Product Listings', duration: '30m', students: 850 },
                            { title: 'Customer Service Mastery', duration: '60m', students: 640 },
                        ].map((course, i) => (
                            <Card key={i} className="overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                                <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                                    <PlayCircle className="h-12 w-12 text-slate-300 group-hover:text-orange-500 transition-colors" />
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-slate-900 mb-1">{course.title}</h3>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>{course.duration} • Video</span>
                                        <span>{course.students} enrolled</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="webinars">
                    <Card>
                        <CardContent className="p-8 text-center text-slate-500">
                            No upcoming webinars scheduled.
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="docs">
                    <div className="space-y-3">
                        {['Platform Guidelines.pdf', 'Shipping Best Practices.pdf', 'API Documentation.pdf'].map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <span className="font-medium text-slate-700">{doc}</span>
                                </div>
                                <Button variant="ghost" size="sm">Download</Button>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
