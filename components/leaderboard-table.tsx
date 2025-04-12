"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Score } from "@/types/score";

export function LeaderboardTable({ scores }: { scores: Score[] }) {
  console.log("scores", scores);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scores.map((score, index) => (
          <TableRow key={score.id}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell>{score.name}</TableCell>
            <TableCell>{score.category}</TableCell>
            <TableCell className="text-right">{score.score}</TableCell>
            <TableCell className="text-right">
              {score.created
                ? new Date(score.created).toLocaleDateString("fi-FI")
                : ""}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
