'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Award, Loader2 } from "lucide-react";
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import CertificateTemplate from '@/components/CertificateTemplate';
import { toast } from "@/components/ui/use-toast"

export default function AdminCertificatesPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [issuedCertificates, setIssuedCertificates] = useState([]);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  
  const [manualMode, setManualMode] = useState(false);
    const [manualStudent, setManualStudent] = useState({ name: '', email: '', collegeName: '', startDate: '', endDate: '' });
  const [tempCertStartDate, setTempCertStartDate] = useState('');
  const [tempCertEndDate, setTempCertEndDate] = useState('');
  const [tempCertCollegeName, setTempCertCollegeName] = useState('');

  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [generatedCertificate, setGeneratedCertificate] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [selectedCertificates, setSelectedCertificates] = useState([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Helper to get props for CertificateTemplate for display/download
  interface Certificate {
    student?: {
      name?: string;
      collegeName?: string;
    };
    course?: {
      name?: string;
    };
    startDate?: string | Date;
    endDate?: string | Date;
  }

  interface CertificateDisplayProps {
    studentName: string;
    courseName: string;
    collegeName: string;
    startDate: string;
    endDate: string;
  }

  const getCertificateDisplayProps = (cert: Certificate): CertificateDisplayProps => {
    const studentName = cert.student?.name || 'N/A';
    const courseName = cert.course?.name || 'N/A';
    const collegeName = cert.student?.collegeName || 'N/A';
    const startDate = cert.startDate ? new Date(cert.startDate).toLocaleDateString() : 'N/A';
    const endDate = cert.endDate ? new Date(cert.endDate).toLocaleDateString() : 'N/A';
    console.log(studentName, courseName, collegeName, startDate, endDate);
    return { studentName, courseName, collegeName, startDate, endDate };
  };

  // Helper to get props for API call when issuing a certificate
  const getCertificateIssueProps = () => {
    let studentId, courseId, collegeName, startDate, endDate;

    if (manualMode) {
      studentId = manualStudent._id; // Assuming manualStudent gets an _id after creation
      courseId = selectedCourse?._id;
      collegeName = manualStudent.collegeName;
      startDate = manualStudent.startDate;
      endDate = manualStudent.endDate;
    } else if (selectedStudent) {
      studentId = selectedStudent._id;
      courseId = selectedCourse?._id;
      collegeName = selectedStudent.collegeName || tempCertCollegeName;
      startDate = selectedBatch?.startDate || tempCertStartDate;
      endDate = selectedBatch?.endDate || tempCertEndDate;
    }

    return { studentId, courseId, collegeName, startDate, endDate };
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [studentsRes, coursesRes, certsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/courses'),
          fetch('/api/admin/certificates'),
        ]);

        const studentsData = await studentsRes.json();
        const coursesData = await coursesRes.json();
        const certsData = await certsRes.json();

        if (studentsData.success) setStudents(studentsData.data);
        if (coursesData.success) setCourses(coursesData.data);
        if (certsData.success) setIssuedCertificates(certsData.data);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: "Error", description: "Failed to load necessary data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  const handleIssueCertificate = async () => {    if (!selectedCourse) {
      toast({ title: "Selection Missing", description: "Please select a course.", variant: "destructive" });
      return;
    }

    let studentForCert = selectedStudent;
    setIssuing(true);
    try {
      let issueProps = getCertificateIssueProps();

      if (manualMode) {
        if (!manualStudent.name || !manualStudent.email || !manualStudent.collegeName || !manualStudent.startDate || !manualStudent.endDate) {
          toast({ title: "Missing Fields", description: "Please enter all manual student details (name, email, college, start date, end date).", variant: "destructive" });
          setIssuing(false);
          return;
        }
        const userRes = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(manualStudent),
        });

        if (userRes.status === 409) {
          toast({ title: "Conflict", description: "A student with this email already exists. Please switch off 'Enter New Student?' and select the existing student from the dropdown.", variant: "destructive" });
          setIssuing(false);
          return;
        }

        const userData = await userRes.json();
        if (!userData.success) {
          toast({ title: "Error", description: userData.message || 'Failed to create new student.', variant: "destructive" });
          setIssuing(false);
          return;
        }
        studentForCert = userData.data;
        issueProps.studentId = studentForCert._id;
        issueProps.collegeName = manualStudent.collegeName;
        setStudents(prev => [studentForCert, ...prev]);
      } else { // Existing student mode
        if (!studentForCert) {
          toast({ title: "Selection Missing", description: "Please select a student.", variant: "destructive" });
          setIssuing(false);
          return;
        }

        if (tempCertCollegeName && studentForCert.collegeName !== tempCertCollegeName) {
          const updateUserRes = await fetch(`/api/admin/users/${studentForCert._id}`,
           {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collegeName: tempCertCollegeName }),
          });
          const updatedUserData = await updateUserRes.json();
          if (!updatedUserData.success) {
            toast({ title: "Warning", description: `Could not update college name: ${updatedUserData.error}` });
            // Do not block certificate generation, just warn
          }
           else {
            // Update the student in the local state as well
            setStudents(prevStudents => prevStudents.map(s => s._id === studentForCert._id ? updatedUserData.data : s));
          }
        }

        if (!issueProps.collegeName) {
          toast({ title: "Missing Details", description: "Selected student is missing college name. Please ensure all details are present.", variant: "destructive" });
          setIssuing(false);
          return;
        }
      }

      if (!issueProps.startDate || !issueProps.endDate) {
        toast({ title: "Missing Dates", description: "Certificate dates (start and end) could not be determined. Please ensure student batch or selected course has valid dates.", variant: "destructive" });
        setIssuing(false);
        return;
      }

      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: issueProps.studentId, 
          courseId: issueProps.courseId,
          startDate: issueProps.startDate,
          endDate: issueProps.endDate,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast({ title: "Success", description: "Certificate issued. Download will start shortly." });
        const newCert = result.data;

        // Ensure the student object in the new certificate has the latest college name
        if (issueProps.collegeName && (!newCert.student.collegeName || newCert.student.collegeName !== issueProps.collegeName)) {
          newCert.student.collegeName = issueProps.collegeName;
        }

        setGeneratedCertificate(newCert);
        setIssuedCertificates(prev => [newCert, ...prev]);

        setSelectedStudent(null);
        setSelectedCourse(null);
        setManualStudent({ name: '', email: '', collegeName: '', startDate: '', endDate: '' });
        setTempCertCollegeName('');

      } else {
        throw new Error(result.error || 'Failed to issue certificate');
      }
    } catch (error) {
      console.error("Issuing certificate failed:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIssuing(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedCertificates }),
      });

      const result = await res.json();

      if (result.success) {
        toast({ title: "Success", description: "Certificates deleted successfully." });
        setIssuedCertificates(prev => prev.filter(cert => !selectedCertificates.includes(cert._id)));
        setSelectedCertificates([]);
        setIsConfirmDialogOpen(false);
      } else {
        throw new Error(result.error || 'Failed to delete certificates');
      }
    } catch (error) {
      console.error("Deleting certificates failed:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    try {
      const res = await fetch(`/api/admin/certificates/${certificateId}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (result.success) {
        toast({ title: "Success", description: "Certificate deleted successfully." });
        setIssuedCertificates(prev => prev.filter(cert => cert._id !== certificateId));
        setIsViewModalOpen(false);
      } else {
        throw new Error(result.error || 'Failed to delete certificate');
      }
    } catch (error) {
      console.error("Deleting certificate failed:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const inputStyles = "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500";

  const isIssueButtonDisabled = () => {
    console.log("Checking if button should be disabled...");
    console.log(`issuing: ${issuing}`);
    console.log(`!selectedCourse: ${!selectedCourse}`);
    console.log(`!selectedStudent && !manualMode: ${!selectedStudent && !manualMode}`);

    if (issuing) return true;
    if (!selectedCourse) return true;
    if (!manualMode && !selectedStudent) return true;

    if (!manualMode && selectedStudent) {
      const missingCollegeName = !selectedStudent.collegeName && !tempCertCollegeName;
      const missingDates = (!selectedBatch?.startDate || !selectedBatch?.endDate) && (!tempCertStartDate || !tempCertEndDate);
      console.log(`missingCollegeName: ${missingCollegeName}`);
      console.log(`missingDates: ${missingDates}`);
      return missingCollegeName || missingDates;
    }

    if (manualMode) {
      const manualFieldsMissing = !manualStudent.name || !manualStudent.email || !manualStudent.collegeName || !manualStudent.startDate || !manualStudent.endDate;
      console.log(`manualFieldsMissing: ${manualFieldsMissing}`);
      return manualFieldsMissing;
    }

    return false;
  };

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Certificate Management</h1>
          <p className="text-slate-300">Issue new certificates and view recently generated ones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Issue New Certificate</CardTitle>
              <CardDescription className="text-slate-300">Select a student and course to issue a new certificate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch id="manual-mode" checked={manualMode} onCheckedChange={(checked) => {
                  setManualMode(checked);
                  setSelectedStudent(null);
                  setManualStudent({ name: '', email: '', collegeName: '', startDate: '', endDate: '' });
                  setTempCertStartDate('');
                  setTempCertEndDate('');
                  setTempCertCollegeName('');
                  setGeneratedCertificate(null); // Clear generated certificate on manual mode toggle
                }} />
                <Label htmlFor="manual-mode" className="text-slate-200">Enter New Student?</Label>
              </div>

              {manualMode ? (
                <div className='space-y-4'>
                  <Input placeholder="Student Name" value={manualStudent.name} onChange={e => setManualStudent({...manualStudent, name: e.target.value})} className={inputStyles} />
                  <Input placeholder="Student Email" value={manualStudent.email} onChange={e => setManualStudent({...manualStudent, email: e.target.value})} className={inputStyles} />
                  <Input placeholder="College Name" value={manualStudent.collegeName} onChange={e => setManualStudent({...manualStudent, collegeName: e.target.value})} className={inputStyles} />
                  <div className="flex gap-2">
                    <Input type="date" placeholder="Start Date" value={manualStudent.startDate} onChange={e => setManualStudent({...manualStudent, startDate: e.target.value})} className={inputStyles} />
                    <Input type="date" placeholder="End Date" value={manualStudent.endDate} onChange={e => setManualStudent({...manualStudent, endDate: e.target.value})} className={inputStyles} />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">


                  <Select onValueChange={id => {
                    const student = students.find(s => s._id === id);
                    setSelectedStudent(student);
                    setGeneratedCertificate(null); // Clear generated certificate on student change

                    if (student?.batches?.length === 1) {
                      const batch = student.batches[0];
                      setSelectedBatch(batch);
                      if (batch.courseId) {
                        setSelectedCourse(batch.courseId);
                      }
                    } else {
                      setSelectedBatch(null);
                      setSelectedCourse(null);
                    }

                    // If student has no complete batch dates, clear temporary dates
                    if (!student?.batches?.length) {
                      setTempCertStartDate('');
                      setTempCertEndDate('');
                    }
                    // If student has no college name, clear temporary college name
                    if (!student?.collegeName) {
                      setTempCertCollegeName('');
                    }
                  }}>
                    <SelectTrigger className={inputStyles}><SelectValue placeholder="Select a student..." /></SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-slate-700">
                      {students.map(s => <SelectItem key={s._id} value={s._id}>{s.name} ({s.email})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {selectedStudent && selectedStudent.batches?.length > 1 && (
                    <div className="space-y-2">
                      <Label className="text-slate-200">Select Batch</Label>
                      <Select onValueChange={batchId => {
                        const batch = selectedStudent.batches.find(b => b._id === batchId);
                        setSelectedBatch(batch);
                        setSelectedCourse(batch.courseId);
                      }}>
                        <SelectTrigger className={inputStyles}><SelectValue placeholder="Select a batch..." /></SelectTrigger>
                        <SelectContent className="bg-slate-800 text-white border-slate-700">
                          {selectedStudent.batches.map(b => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedStudent && (
                    <div className="mt-4 p-3 border border-slate-700 rounded-md bg-slate-800/50 text-sm">
                      <p className="font-bold text-slate-200">Selected Student Details:</p>
                      <p>Name: {selectedStudent.name}</p>
                      <p>Email: {selectedStudent.email}</p>
                      {selectedBatch?.courseId?.name && (
                        <p>Batch Course: {selectedBatch.courseId.name}</p>
                      )}
                      <p>College: {selectedStudent.collegeName || 'N/A'}</p>
                      {!selectedStudent.collegeName && (
                        <div className="mt-2 space-y-2">
                          <p className="text-yellow-400">No college name found. Please enter college name:</p>
                          <Input placeholder="College Name" value={tempCertCollegeName} onChange={e => setTempCertCollegeName(e.target.value)} className={inputStyles} />
                        </div>
                      )}
                      {selectedBatch?.startDate && selectedBatch?.endDate ? (
                        <p>Batch: {selectedBatch.name} ({new Date(selectedBatch.startDate).toLocaleDateString()} - {new Date(selectedBatch.endDate).toLocaleDateString()})</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          <p className="text-yellow-400">No batch details found. Please enter certificate dates:</p>
                          <div className="flex gap-2">
                            <Input type="date" placeholder="Start Date" value={tempCertStartDate} onChange={e => setTempCertStartDate(e.target.value)} className={inputStyles} />
                            <Input type="date" placeholder="End Date" value={tempCertEndDate} onChange={e => setTempCertEndDate(e.target.value)} className={inputStyles} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-200">Course Name</Label>
                <Select onValueChange={id => setSelectedCourse(courses.find(c => c._id === id))} value={selectedCourse?._id || ''} disabled={selectedBatch && selectedBatch.courseId}>
                  <SelectTrigger className={inputStyles}><SelectValue placeholder="Select a course..." /></SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-slate-700">
                    {courses.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleIssueCertificate} disabled={isIssueButtonDisabled()} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300">
                {issuing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />} 
                Generate & Issue Certificate
              </Button>
              {generatedCertificate && (
                <PDFDownloadLink
                  document={<CertificateTemplate 
                    {...getCertificateDisplayProps(generatedCertificate)}
                    issueDate={new Date(generatedCertificate.issueDate).toLocaleDateString()}
                    certificateId={generatedCertificate.certificateId}
                  />}
                  fileName={`${generatedCertificate.student?.name.replace(/ /g, '_')}_${generatedCertificate.course?.name.replace(/ /g, '_')}_Certificate.pdf`}
                  className="w-full mt-2 inline-block text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-all duration-300"
                >
                  {({ loading }) => loading ? 'Preparing document...' : 'Download Certificate' }
                </PDFDownloadLink>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/30 backdrop-blur-lg border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Recently Issued Certificates</CardTitle>
              <CardDescription className="text-slate-300">A list of the most recently issued certificates.</CardDescription>
              {selectedCertificates.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">{selectedCertificates.length} selected</p>
                  <Button variant="destructive" onClick={() => setIsConfirmDialogOpen(true)}>
                    Delete Selected
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="text-white">
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-800/50">
                        <TableHead className="text-slate-200">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCertificates(issuedCertificates.map(c => c._id));
                              } else {
                                setSelectedCertificates([]);
                              }
                            }}
                            checked={selectedCertificates.length === issuedCertificates.length && issuedCertificates.length > 0}
                          />
                        </TableHead>
                        <TableHead className="text-slate-200">Student</TableHead>
                        <TableHead className="text-slate-200">Course</TableHead>
                        <TableHead className="text-slate-200">Date Issued</TableHead>
                        <TableHead className="text-slate-200">Certificate ID</TableHead>
                        <TableHead className="text-slate-200">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issuedCertificates.map((cert) => (
                        <TableRow key={cert._id} className="border-slate-800">
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedCertificates.includes(cert._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCertificates([...selectedCertificates, cert._id]);
                                } else {
                                  setSelectedCertificates(selectedCertificates.filter(id => id !== cert._id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{cert.student?.name || 'N/A'}</TableCell>
                          <TableCell>{cert.course?.name || 'N/A'}</TableCell>
                          <TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                          <TableCell className="font-mono">{cert.certificateId}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={async () => {
                              setViewingCertificate(cert);
                              const certProps = getCertificateDisplayProps(cert);
                              const doc = <CertificateTemplate
                                {...certProps}
                                issueDate={new Date(cert.issueDate).toLocaleDateString()}
                                certificateId={cert.certificateId}
                              />;
                              const blob = await pdf(doc).toBlob();
                              setPdfBlobUrl(URL.createObjectURL(blob));
                              setIsViewModalOpen(true);
                            }}>View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-4xl bg-slate-900 text-white border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Certificate Preview</DialogTitle>
            <DialogDescription className="text-slate-300">
              View the certificate and download it as a PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {viewingCertificate && pdfBlobUrl && (
              <div className="space-y-4">
                <iframe src={pdfBlobUrl} width="100%" height="450px" className="border-none rounded-lg bg-white"></iframe>
                <PDFDownloadLink
                  document={<CertificateTemplate
                    {...getCertificateDisplayProps(viewingCertificate)}
                    issueDate={new Date(viewingCertificate.issueDate).toLocaleDateString()}
                    certificateId={viewingCertificate.certificateId}
                  />}
                  fileName={`${viewingCertificate.student?.name.replace(/ /g, '_')}_${viewingCertificate.course?.name.replace(/ /g, '_')}_Certificate.pdf`}
                  className="w-full mt-2 inline-block text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-all duration-300"
                >
                  {({ loading }) => loading ? 'Preparing document...' : 'Download Certificate'}
                </PDFDownloadLink>
                <Button
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={() => handleDeleteCertificate(viewingCertificate._id)}
                >
                  Delete Certificate
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected certificates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Yes, delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}