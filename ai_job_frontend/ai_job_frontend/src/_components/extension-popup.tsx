// "use client";

// import { useState } from "react";
// import { CheckCircle2, Sparkles, Zap } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";

// interface MatchedField {
//   label: string;
//   value: string;
//   matched: boolean;
// }

// export function ExtensionPopup() {
//   const [isAutofilling, setIsAutofilling] = useState(false);
//   const [matchScore] = useState(87);

//   const matchedFields: MatchedField[] = [
//     { label: "Full Name", value: "John Smith", matched: true },
//     { label: "Email", value: "john@example.com", matched: true },
//     { label: "Phone", value: "(555) 123-4567", matched: true },
//     { label: "Address", value: "123 Main St", matched: false },
//   ];

//   const handleAutofill = () => {
//     setIsAutofilling(true);
//     setTimeout(() => setIsAutofilling(false), 1500);
//   };

//   const getScoreColor = (score: number) => {
//     if (score >= 80) return "text-accent";
//     if (score >= 60) return "text-amber-500";
//     return "text-destructive";
//   };

//   const getScoreRingColor = (score: number) => {
//     if (score >= 80) return "stroke-accent";
//     if (score >= 60) return "stroke-amber-500";
//     return "stroke-destructive";
//   };

//   return (
//     <Card className="w-[400px] border-border shadow-lg">
//       <CardHeader className="pb-3 pt-4 px-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
//               <Zap className="h-4 w-4 text-primary-foreground" />
//             </div>
//             <div>
//               <h2 className="text-sm font-semibold text-foreground">
//                 FormFill AI
//               </h2>
//               <p className="text-xs text-muted-foreground">Smart autofill</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1">
//             <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
//             <span className="text-xs font-medium text-secondary-foreground">
//               Active
//             </span>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent className="px-4 pb-4 pt-0">
//         <div className="mb-4 flex items-center gap-4 rounded-lg bg-secondary/50 p-4">
//           <div className="relative">
//             <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
//               <circle
//                 cx="18"
//                 cy="18"
//                 r="15.5"
//                 fill="none"
//                 className="stroke-muted"
//                 strokeWidth="3"
//               />
//               <circle
//                 cx="18"
//                 cy="18"
//                 r="15.5"
//                 fill="none"
//                 className={getScoreRingColor(matchScore)}
//                 strokeWidth="3"
//                 strokeLinecap="round"
//                 strokeDasharray={`${matchScore} 100`}
//               />
//             </svg>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <span className={`text-lg font-bold ${getScoreColor(matchScore)}`}>
//                 {matchScore}%
//               </span>
//             </div>
//           </div>
//           <div className="flex-1">
//             <h3 className="text-sm font-semibold text-foreground">Match Score</h3>
//             <p className="mt-0.5 text-xs text-muted-foreground">
//               {matchScore >= 80
//                 ? "Excellent match! Most fields detected."
//                 : matchScore >= 60
//                   ? "Good match. Some fields may need review."
//                   : "Partial match. Manual input recommended."}
//             </p>
//           </div>
//         </div>

//         <div className="mb-4 space-y-2">
//           <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
//             Detected Fields
//           </h4>
//           <div className="space-y-1.5">
//             {matchedFields.map((field, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2"
//               >
//                 <div className="flex items-center gap-2">
//                   <CheckCircle2
//                     className={`h-3.5 w-3.5 ${
//                       field.matched ? "text-accent" : "text-muted-foreground/40"
//                     }`}
//                   />
//                   <span className="text-xs text-muted-foreground">
//                     {field.label}
//                   </span>
//                 </div>
//                 <span className="max-w-[140px] truncate text-xs font-medium text-foreground">
//                   {field.value}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <Button
//           onClick={handleAutofill}
//           disabled={isAutofilling}
//           className="h-10 w-full font-medium"
//           size="lg"
//         >
//           {isAutofilling ? (
//             <>
//               <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
//               Filling...
//             </>
//           ) : (
//             <>
//               <Sparkles className="mr-2 h-4 w-4" />
//               Autofill Form
//             </>
//           )}
//         </Button>

//         <p className="mt-3 text-center text-[10px] text-muted-foreground">
//           Your data stays on your device
//         </p>
//       </CardContent>
//     </Card>
//   );
// }
