'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChessKnightIcon } from '@/components/icons/ChessKnightIcon';
import { useToast } from "@/hooks/use-toast";

type Cell = {
  x: number;
  y: number;
  step: number | null;
  isCurrent: boolean;
  isPath: boolean;
};

const KNIGHT_MOVES = [
  { x: 1, y: 2 }, { x: 1, y: -2 },
  { x: -1, y: 2 }, { x: -1, y: -2 },
  { x: 2, y: 1 }, { x: 2, y: -1 },
  { x: -2, y: 1 }, { x: -2, y: -1 },
];

const KnightTourPage: React.FC = () => {
  const [boardSize, setBoardSize] = useState<number>(5);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [tourPath, setTourPath] = useState<{ x: number; y: number }[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isVisualizing, setIsVisualizing] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(300); // milliseconds
  const { toast } = useToast();

  const initializeBoard = useCallback((size: number): Cell[][] => {
    return Array(size)
      .fill(null)
      .map((_, rowIndex) =>
        Array(size)
          .fill(null)
          .map((_, colIndex) => ({
            x: colIndex,
            y: rowIndex,
            step: null,
            isCurrent: false,
            isPath: false,
          }))
      );
  }, []);

  useEffect(() => {
    setBoard(initializeBoard(boardSize));
    setTourPath([]);
    setCurrentStep(0);
    setIsVisualizing(false);
  }, [boardSize, initializeBoard]);

  const isValidMove = (x: number, y: number, size: number, visited: boolean[][]): boolean => {
    return x >= 0 && x < size && y >= 0 && y < size && !visited[y][x];
  };

  const findTour = (size: number): { x: number; y: number }[] | null => {
    const path: { x: number; y: number }[] = [];
    const visited: boolean[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(false));

    // Try to find a solution from a few common starting points or a random one for larger boards
    // For simplicity, we'll try starting from (0,0)
    // A more robust solution might try multiple starting points or a more advanced heuristic.
    const startX = 0;
    const startY = 0;

    path.push({ x: startX, y: startY });
    visited[startY][startX] = true;

    if (solveTourUtil(startX, startY, 1, size, visited, path, KNIGHT_MOVES)) {
      return path;
    }
    return null; // No solution found from this starting point
  };
  
  // Backtracking utility
  const solveTourUtil = (
    currX: number,
    currY: number,
    moveCount: number,
    size: number,
    visited: boolean[][],
    path: { x: number; y: number }[],
    moves: {x: number, y: number}[]
  ): boolean => {
    if (moveCount === size * size) {
      return true;
    }
  
    // Warnsdorff's rule: move to the square from which the knight will have the fewest onward moves.
    // This is a heuristic that significantly improves finding a solution.
    const nextMoves = [];
    for (const move of moves) {
      const nextX = currX + move.x;
      const nextY = currY + move.y;
      if (isValidMove(nextX, nextY, size, visited)) {
        let count = 0;
        for (const nextNextMove of moves) {
          if (isValidMove(nextX + nextNextMove.x, nextY + nextNextMove.y, size, visited)) {
            count++;
          }
        }
        nextMoves.push({ x: nextX, y: nextY, onwardMoves: count });
      }
    }
    
    nextMoves.sort((a, b) => a.onwardMoves - b.onwardMoves);

    for (const nextMove of nextMoves) {
      const { x: nextX, y: nextY } = nextMove;
      path.push({ x: nextX, y: nextY });
      visited[nextY][nextX] = true;
  
      if (solveTourUtil(nextX, nextY, moveCount + 1, size, visited, path, moves)) {
        return true;
      }
  
      // Backtrack
      path.pop();
      visited[nextY][nextX] = false;
    }
  
    return false;
  };

  const handleStartVisualization = () => {
    setIsVisualizing(true);
    setCurrentStep(0);
    const newBoard = initializeBoard(boardSize);
    setBoard(newBoard);

    const foundPath = findTour(boardSize);
    if (foundPath) {
      setTourPath(foundPath);
      toast({
        title: "Tour Found!",
        description: `Starting visualization for a ${boardSize}x${boardSize} board.`,
      });
    } else {
      setTourPath([]);
      setIsVisualizing(false);
      toast({
        title: "No Tour Found",
        description: `Could not find a Knight's Tour for a ${boardSize}x${boardSize} board from the starting position. Try a different size or refresh.`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isVisualizing && tourPath.length > 0 && currentStep < tourPath.length) {
      const timer = setTimeout(() => {
        setBoard((prevBoard) => {
          const newBoard = prevBoard.map((row) =>
            row.map((cell) => ({
              ...cell,
              isCurrent: false,
              isPath: cell.isPath || (cell.x === tourPath[currentStep].x && cell.y === tourPath[currentStep].y),
            }))
          );
          const { x, y } = tourPath[currentStep];
          if (newBoard[y] && newBoard[y][x]) {
            newBoard[y][x].step = currentStep + 1;
            newBoard[y][x].isCurrent = true;
          }
          return newBoard;
        });
        setCurrentStep((prev) => prev + 1);
      }, animationSpeed);
      return () => clearTimeout(timer);
    } else if (isVisualizing && currentStep >= tourPath.length && tourPath.length > 0) {
      setIsVisualizing(false);
       toast({
        title: "Tour Complete!",
        description: `Knight successfully visited all ${boardSize*boardSize} squares.`,
      });
    }
  }, [isVisualizing, currentStep, tourPath, animationSpeed, boardSize, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Knight's Tour Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Label htmlFor="board-size-select" className="text-lg">Board Size:</Label>
              <Select
                value={boardSize.toString()}
                onValueChange={(value) => {
                  setBoardSize(parseInt(value));
                  setIsVisualizing(false); // Reset visualization on size change
                }}
                disabled={isVisualizing}
              >
                <SelectTrigger id="board-size-select" className="w-[120px] bg-card text-card-foreground">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 6, 7, 8, 9].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}x{size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="speed-select" className="text-lg">Speed:</Label>
              <Select
                value={animationSpeed.toString()}
                onValueChange={(value) => setAnimationSpeed(parseInt(value))}
                disabled={isVisualizing}
              >
                <SelectTrigger id="speed-select" className="w-[120px] bg-card text-card-foreground">
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">Slow</SelectItem>
                  <SelectItem value="300">Medium</SelectItem>
                  <SelectItem value="100">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleStartVisualization} disabled={isVisualizing} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isVisualizing ? 'Visualizing...' : "Start Tour"}
            </Button>
          </div>

          <div
            className="grid border border-border shadow-md bg-card rounded-md"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
              width: '100%',
              aspectRatio: '1 / 1',
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`flex items-center justify-center border border-border 
                              transition-colors duration-300 ease-in-out
                              ${(rowIndex + colIndex) % 2 === 0 ? 'bg-secondary/50' : 'bg-background'}
                              ${cell.isPath ? 'bg-accent/30' : ''}
                              ${cell.isCurrent ? '!bg-accent' : ''}
                              text-sm md:text-base lg:text-lg font-mono`}
                  style={{ aspectRatio: '1 / 1' }}
                  aria-label={`Cell ${cell.x + 1}, ${cell.y + 1}${cell.step ? `, step ${cell.step}` : ''}`}
                >
                  {cell.isCurrent ? (
                    <ChessKnightIcon className="w-3/5 h-3/5 text-accent-foreground animate-pulse" />
                  ) : cell.step !== null ? (
                    <span className={`font-bold ${cell.isPath ? 'text-accent-foreground' : 'text-foreground'}`}>
                      {cell.step}
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground">
        <p>Select board size and click "Start Tour" to visualize the Knight's journey.</p>
      </footer>
    </div>
  );
};

export default KnightTourPage;
