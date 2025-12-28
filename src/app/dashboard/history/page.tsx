'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { labelingHistory as initialHistory, labels } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

type HistoryItem = {
  id: string;
  fileName: string;
  label: string;
  user: string;
  timestamp: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const openEditDialog = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setNewLabel(item.label);
    setIsEditDialogOpen(true);
  };

  const handleUpdateLabel = () => {
    if (!selectedHistoryItem || !newLabel) return;

    // Simulate API call to update the label
    console.log(`Updating ${selectedHistoryItem.fileName} from ${selectedHistoryItem.label} to ${newLabel}`);

    setHistory(history.map(item => 
      item.id === selectedHistoryItem.id ? { ...item, label: newLabel, timestamp: new Date().toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }) } : item
    ));

    toast({
      title: 'Label Updated',
      description: `Successfully updated ${selectedHistoryItem.fileName} to ${newLabel}.`,
    });
    
    setIsEditDialogOpen(false);
    setSelectedHistoryItem(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">My Labeling History</h1>
        <p className="text-muted-foreground">
          Review and edit your past labeling activity.
        </p>
      </header>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Label for {selectedHistoryItem?.fileName}</DialogTitle>
            <DialogDescription>
              Select a new label for this audio file. This will simulate updating the file and the log.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={setNewLabel} defaultValue={newLabel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a new label" />
              </SelectTrigger>
              <SelectContent>
                {labels.map(label => (
                  <SelectItem key={label.id} value={label.name}>{label.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateLabel}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.fileName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.label}</Badge>
                  </TableCell>
                  <TableCell>{item.timestamp}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit Label</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
