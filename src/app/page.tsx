
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
  const [animationSpeed, setAnimationSpeed] = useState<number>(300);
  const { toast } = useToast();

  // User play state
  const [isUserPlaying, setIsUserPlaying] = useState<boolean>(false);
  const [userPath, setUserPath] = useState<{ x: number; y: number }[]>([]);
  const [userCurrentPosition, setUserCurrentPosition] = useState<{ x: number; y: number } | null>(null);

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
    // Reset user play state as well when board size changes
    setIsUserPlaying(false);
    setUserPath([]);
    setUserCurrentPosition(null);
  }, [boardSize, initializeBoard]);

  const isValidMove = (x: number, y: number, size: number, currentBoardState: Cell[][]): boolean => {
    return x >= 0 && x < size && y >= 0 && y < size && currentBoardState[y][x].step === null;
  };
  
  const findTour = (size: number): { x: number; y: number }[] | null => {
    const path: { x: number; y: number }[] = [];
    // Create a temporary visited array for the AI solver based on a clean board
    const visitedForSolver: boolean[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(false));

    const startX = 0;
    const startY = 0;

    path.push({ x: startX, y: startY });
    visitedForSolver[startY][startX] = true;

    if (solveTourUtil(startX, startY, 1, size, visitedForSolver, path, KNIGHT_MOVES)) {
      return path;
    }
    return null;
  };
  
  const solveTourUtil = (
    currX: number,
    currY: number,
    moveCount: number,
    size: number,
    visited: boolean[][], // This visited is for the AI solver
    path: { x: number; y: number }[],
    moves: {x: number, y: number}[]
  ): boolean => {
    if (moveCount === size * size) {
      return true;
    }
  
    const nextMoves = [];
    for (const move of moves) {
      const nextX = currX + move.x;
      const nextY = currY + move.y;
      // Use the passed 'visited' for AI solver's isValidMove checks
      if (nextX >= 0 && nextX < size && nextY >= 0 && nextY < size && !visited[nextY][nextX]) {
        let count = 0;
        for (const nextNextMove of moves) {
           if (nextX + nextNextMove.x >= 0 && nextX + nextNextMove.x < size &&
               nextY + nextNextMove.y >= 0 && nextY + nextNextMove.y < size &&
               !visited[nextY + nextNextMove.y][nextX + nextNextMove.x]) {
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
  
      path.pop();
      visited[nextY][nextX] = false;
    }
  
    return false;
  };

  const handleStartVisualization = () => {
    if (isUserPlaying) setIsUserPlaying(false); // Stop user play if active
    setIsVisualizing(true);
    setCurrentStep(0);
    const newBoard = initializeBoard(boardSize);
    setBoard(newBoard);
    setUserPath([]);
    setUserCurrentPosition(null);


    const foundPath = findTour(boardSize);
    if (foundPath) {
      setTourPath(foundPath);
      toast({
        title: "AI Tour Found!",
        description: `Starting visualization for a ${boardSize}x${boardSize} board.`,
      });
    } else {
      setTourPath([]);
      setIsVisualizing(false);
      toast({
        title: "No AI Tour Found",
        description: `Could not find a Knight's Tour for a ${boardSize}x${boardSize} board from the starting position.`,
        variant: "destructive",
      });
    }
  };

  // AI Visualization useEffect
  useEffect(() => {
    if (isVisualizing && !isUserPlaying && tourPath.length > 0 && currentStep < tourPath.length) {
      const timer = setTimeout(() => {
        setBoard((prevBoard) => {
          const newBoard = prevBoard.map((row) =>
            row.map((cell) => ({
              ...cell,
              isCurrent: false,
              // Persist path for AI visualization
              isPath: cell.isPath || (tourPath[currentStep] && cell.x === tourPath[currentStep].x && cell.y === tourPath[currentStep].y),
            }))
          );
          if (tourPath[currentStep]) {
            const { x, y } = tourPath[currentStep];
            if (newBoard[y] && newBoard[y][x]) {
              newBoard[y][x].step = currentStep + 1;
              newBoard[y][x].isCurrent = true;
            }
          }
          return newBoard;
        });
        setCurrentStep((prev) => prev + 1);
      }, animationSpeed);
      return () => clearTimeout(timer);
    } else if (isVisualizing && !isUserPlaying && currentStep >= tourPath.length && tourPath.length > 0) {
      setIsVisualizing(false);
       toast({
        title: "AI Tour Complete!",
        description: `Knight successfully visited all ${boardSize*boardSize} squares.`,
      });
    }
  }, [isVisualizing, currentStep, tourPath, animationSpeed, boardSize, toast, isUserPlaying]);


  const handleToggleUserPlay = () => {
    if (isUserPlaying) { // Stop playing
      setIsUserPlaying(false);
      setUserPath([]);
      setUserCurrentPosition(null);
      setBoard(initializeBoard(boardSize));
      toast({ title: "Play Mode Deactivated." });
    } else { // Start playing
      setIsUserPlaying(true);
      setIsVisualizing(false); // Stop AI visualization if active
      setTourPath([]);
      setCurrentStep(0);
      setUserPath([]);
      setUserCurrentPosition(null);
      setBoard(initializeBoard(boardSize));
      toast({
        title: "Play Mode Activated!",
        description: "Click a square on the board to place your knight and start the tour.",
      });
    }
  };

  const getValidMovesFromPosition = (posX: number, posY: number, currentBoardState: Cell[][], bSize: number): {x: number, y:number}[] => {
    const validMoves: {x:number, y:number}[] = [];
    KNIGHT_MOVES.forEach(move => {
      const nextX = posX + move.x;
      const nextY = posY + move.y;
      if (isValidMove(nextX, nextY, bSize, currentBoardState)) {
        validMoves.push({ x: nextX, y: nextY });
      }
    });
    return validMoves;
  };

  const handleCellClick = (clickedCellCoords: { x: number; y: number }) => {
    if (!isUserPlaying || isVisualizing) return;

    const newBoard = board.map(row => row.map(cell => ({ ...cell }))); // Deep copy

    if (!userCurrentPosition) { // First move
      newBoard[clickedCellCoords.y][clickedCellCoords.x].step = 1;
      newBoard[clickedCellCoords.y][clickedCellCoords.x].isCurrent = true;
      
      setBoard(newBoard);
      setUserCurrentPosition(clickedCellCoords);
      setUserPath([clickedCellCoords]);
      toast({ description: "Knight placed. Make your next move." });
    } else { // Subsequent moves
      const { x: currentX, y: currentY } = userCurrentPosition;
      const { x: targetX, y: targetY } = clickedCellCoords;

      const dx = Math.abs(targetX - currentX);
      const dy = Math.abs(targetY - currentY);
      const isKnightMoveRule = (dx === 1 && dy === 2) || (dx === 2 && dy === 1);

      if (isKnightMoveRule && isValidMove(targetX, targetY, boardSize, board)) {
        // Valid move
        newBoard[currentY][currentX].isCurrent = false;
        newBoard[currentY][currentX].isPath = true;

        newBoard[targetY][targetX].step = userPath.length + 1;
        newBoard[targetY][targetX].isCurrent = true;

        const newPath = [...userPath, clickedCellCoords];
        setBoard(newBoard);
        setUserCurrentPosition(clickedCellCoords);
        setUserPath(newPath);

        if (newPath.length === boardSize * boardSize) {
          toast({
            title: "Congratulations!",
            description: "You've completed the Knight's Tour!",
          });
          setIsUserPlaying(false);
        } else {
          const availableMoves = getValidMovesFromPosition(targetX, targetY, newBoard, boardSize);
          if (availableMoves.length === 0) {
            toast({
              title: "Game Over!",
              description: "No more valid moves. You got stuck.",
              variant: "destructive",
            });
            setIsUserPlaying(false);
          }
        }
      } else {
        toast({
          description: "Invalid move. Please choose a valid, unvisited square.",
          variant: "destructive",
        });
      }
    }
  };


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
                }}
                disabled={isVisualizing || isUserPlaying}
              >
                <SelectTrigger id="board-size-select" className="w-[120px] bg-card text-card-foreground">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 6, 7, 8, 9, 10].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}x{size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="speed-select" className="text-lg">AI Speed:</Label>
              <Select
                value={animationSpeed.toString()}
                onValueChange={(value) => setAnimationSpeed(parseInt(value))}
                disabled={isVisualizing || isUserPlaying}
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
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={handleStartVisualization} 
                disabled={isVisualizing || isUserPlaying} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isVisualizing ? 'Visualizing AI...' : "Start AI Tour"}
              </Button>
              <Button 
                onClick={handleToggleUserPlay} 
                disabled={isVisualizing}
                variant={isUserPlaying ? "destructive" : "default"}
                className={isUserPlaying ? "" : "bg-accent hover:bg-accent/90 text-accent-foreground"}
              >
                {isUserPlaying ? 'Stop Playing' : "Play Yourself"}
              </Button>
            </div>
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
                              transition-colors duration-100 ease-in-out
                              ${(rowIndex + colIndex) % 2 === 0 ? 'bg-secondary/50' : 'bg-background'}
                              ${cell.isPath ? 'bg-accent/30' : ''}
                              ${cell.isCurrent ? '!bg-accent' : ''}
                              ${isUserPlaying && !isVisualizing && cell.step === null ? 'cursor-pointer hover:bg-primary/20' : ''}
                              ${isUserPlaying && !isVisualizing && cell.step !== null ? 'cursor-not-allowed' : ''}
                              text-sm md:text-base lg:text-lg font-mono`}
                  style={{ aspectRatio: '1 / 1' }}
                  onClick={() => handleCellClick({ x: cell.x, y: cell.y })}
                  aria-label={`Cell ${cell.x + 1}, ${cell.y + 1}${cell.step ? `, step ${cell.step}` : ''} ${isUserPlaying && !isVisualizing && cell.step === null ? ', clickable' : ''}`}
                  role={isUserPlaying && !isVisualizing ? "button" : "gridcell"}
                  tabIndex={isUserPlaying && !isVisualizing && cell.step === null ? 0 : -1}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && isUserPlaying && !isVisualizing && cell.step === null) {
                      handleCellClick({ x: cell.x, y: cell.y });
                    }
                  }}
                >
                  {cell.isCurrent ? (
                    <ChessKnightIcon className="w-3/5 h-3/5 text-accent-foreground animate-pulse" />
                  ) : cell.step !== null ? (
                    <span className="font-bold text-foreground"> {/* Ensured text-foreground for step numbers */}
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
        <p>
          {isUserPlaying 
            ? "You are playing! Click on a valid square to move the knight." 
            : isVisualizing 
            ? "Visualizing AI Knight's Tour..."
            : "Select board size, speed for AI, and start a tour or play yourself."
          }
        </p>
      </footer>
    </div>
  );
};

export default KnightTourPage;

    
