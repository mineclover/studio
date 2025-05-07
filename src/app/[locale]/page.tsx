
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChessKnightIcon } from '@/components/icons/ChessKnightIcon';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

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

type GameMessage = {
  type: 'success' | 'error' | 'info' | null;
  text: string | null;
};

const KnightTourPage: React.FC = () => {
  const [boardSize, setBoardSize] = useState<number>(5);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [tourPath, setTourPath] = useState<{ x: number; y: number }[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isVisualizing, setIsVisualizing] = useState<boolean>(false);
  // const [animationSpeed, setAnimationSpeed] = useState<number>(300); // AI Speed control removed
  const { toast } = useToast();

  // User play state
  const [isUserPlaying, setIsUserPlaying] = useState<boolean>(false);
  const [userPath, setUserPath] = useState<{ x: number; y: number }[]>([]);
  const [userCurrentPosition, setUserCurrentPosition] = useState<{ x: number; y: number } | null>(null);

  // Timer state
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in seconds

  // Game status/message state
  const [gameMessage, setGameMessage] = useState<GameMessage>({ type: null, text: null });

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
    // This effect handles board size changes
    setIsUserPlaying(false); // Stop any active game
    setIsVisualizing(false); // Stop AI visualization
    resetUserPlayState(false); // Reset all game states
    setBoard(initializeBoard(boardSize)); // Initialize new board
  }, [boardSize, initializeBoard]);


  // Timer useEffect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (timerActive && startTime !== null) {
      intervalId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else if (!timerActive && intervalId) {
      clearInterval(intervalId);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerActive, startTime]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetUserPlayState = (notifyStart: boolean = false) => {
    setUserPath([]);
    setUserCurrentPosition(null);
    // board reset is handled by initializeBoard call in parent handlers or boardSize effect
    setElapsedTime(0);
    setStartTime(null);
    setTimerActive(false);
    if (notifyStart) {
       setGameMessage({ type: 'info', text: 'Click a square to place your knight and start the tour.' });
    } else {
       setGameMessage({ type: null, text: null });
    }
  };

  const handleStartUserPlay = () => {
    setIsUserPlaying(true);
    setIsVisualizing(false); 
    setTourPath([]); 
    setCurrentStep(0); 
    setBoard(initializeBoard(boardSize)); // Ensure board is fresh
    resetUserPlayState(true);
    // Toast is optional here as gameMessage provides in-UI feedback
    // toast({
    //   title: "Play Mode Activated!",
    //   description: "Click a square on the board to place your knight.",
    // });
  };

  const handleStopUserPlay = () => {
    setIsUserPlaying(false);
    setBoard(initializeBoard(boardSize)); // Reset board to clean state
    resetUserPlayState(false);
    toast({ title: "Game Stopped." });
  };
  
  const isValidMove = (x: number, y: number, size: number, currentBoardState: Cell[][]): boolean => {
    return x >= 0 && x < size && y >= 0 && y < size && currentBoardState[y][x].step === null;
  };
  
  const findTour = (size: number): { x: number; y: number }[] | null => {
    const path: { x: number; y: number }[] = [];
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
    visited: boolean[][],
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
    if (isUserPlaying) handleStopUserPlay(); 
    
    setIsVisualizing(true);
    setCurrentStep(0);
    const newBoard = initializeBoard(boardSize);
    setBoard(newBoard);
    setUserPath([]); // Clear user path as well
    setUserCurrentPosition(null);
    setGameMessage({ type: 'info', text: 'AI is thinking...' });


    const foundPath = findTour(boardSize);
    if (foundPath) {
      setTourPath(foundPath);
      setGameMessage({ type: 'info', text: `AI found a tour! Starting visualization.` });
      // toast({
      //   title: "AI Tour Found!",
      //   description: `Starting visualization for a ${boardSize}x${boardSize} board.`,
      // });
    } else {
      setTourPath([]);
      setIsVisualizing(false);
      setGameMessage({ type: 'error', text: `AI could not find a tour for a ${boardSize}x${boardSize} board from (0,0).` });
      // toast({
      //   title: "No AI Tour Found",
      //   description: `Could not find a Knight's Tour for a ${boardSize}x${boardSize} board from the starting position.`,
      //   variant: "destructive",
      // });
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
      }, 300); // AI speed is fixed here
      return () => clearTimeout(timer);
    } else if (isVisualizing && !isUserPlaying && currentStep >= tourPath.length && tourPath.length > 0) {
      setIsVisualizing(false);
      setGameMessage({ type: 'info', text: `AI Tour Complete! Visited all ${boardSize*boardSize} squares.` });
       // toast({
       //  title: "AI Tour Complete!",
       //  description: `Knight successfully visited all ${boardSize*boardSize} squares.`,
      // });
    }
  }, [isVisualizing, currentStep, tourPath, boardSize, isUserPlaying, initializeBoard]); // Removed animationSpeed


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

    const newBoard = board.map(row => row.map(cell => ({ ...cell }))); 

    if (!userCurrentPosition) { // First move
      newBoard[clickedCellCoords.y][clickedCellCoords.x].step = 1;
      newBoard[clickedCellCoords.y][clickedCellCoords.x].isCurrent = true;
      
      setBoard(newBoard);
      setUserCurrentPosition(clickedCellCoords);
      setUserPath([clickedCellCoords]);
      setStartTime(Date.now());
      setTimerActive(true);
      setGameMessage({ type: 'info', text: "Knight placed. Make your next move." });
      // toast({ description: "Knight placed. Make your next move." });
    } else { // Subsequent moves
      const { x: currentX, y: currentY } = userCurrentPosition;
      const { x: targetX, y: targetY } = clickedCellCoords;

      const dx = Math.abs(targetX - currentX);
      const dy = Math.abs(targetY - currentY);
      const isKnightMoveRule = (dx === 1 && dy === 2) || (dx === 2 && dy === 1);

      if (isKnightMoveRule && isValidMove(targetX, targetY, boardSize, board)) {
        newBoard[currentY][currentX].isCurrent = false;
        newBoard[currentY][currentX].isPath = true;

        newBoard[targetY][targetX].step = userPath.length + 1;
        newBoard[targetY][targetX].isCurrent = true;

        const newPath = [...userPath, clickedCellCoords];
        setBoard(newBoard);
        setUserCurrentPosition(clickedCellCoords);
        setUserPath(newPath);
        setGameMessage({ type: 'info', text: 'Good move!' });

        if (newPath.length === boardSize * boardSize) {
          setTimerActive(false);
          setGameMessage({ type: 'success', text: `Congratulations! You completed the Knight's Tour in ${formatTime(elapsedTime)}!` });
          setIsUserPlaying(false); // End game, but don't reset board to show path
          // toast({
          //   title: "Congratulations!",
          //   description: `You've completed the Knight's Tour in ${formatTime(elapsedTime)}!`,
          // });
        } else {
          const availableMoves = getValidMovesFromPosition(targetX, targetY, newBoard, boardSize);
          if (availableMoves.length === 0) {
            setTimerActive(false);
            setGameMessage({ type: 'error', text: `Game Over! No more valid moves. You made ${newPath.length} moves in ${formatTime(elapsedTime)}.` });
            setIsUserPlaying(false); // End game
            // toast({
            //   title: "Game Over!",
            //   description: "No more valid moves. You got stuck.",
            //   variant: "destructive",
            // });
          }
        }
      } else {
        setGameMessage({ type: 'error', text: "Invalid move. Choose a valid, unvisited square." });
        // toast({
        //   description: "Invalid move. Please choose a valid, unvisited square.",
        //   variant: "destructive",
        // });
      }
    }
  };

  const isGameActive = isUserPlaying || isVisualizing;
  const isBoardInteractable = isUserPlaying && !isVisualizing;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
                disabled={isGameActive}
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
           
            {/* User Play Controls */}
            <div className="flex flex-wrap justify-center gap-4">
              {!isUserPlaying && gameMessage?.type !== 'success' && gameMessage?.type !== 'error' && (
                <Button 
                  onClick={handleStartUserPlay} 
                  disabled={isVisualizing}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Play Yourself
                </Button>
              )}
              {isUserPlaying && (
                 <Button 
                  onClick={handleStopUserPlay} 
                  variant="destructive"
                >
                  Stop Playing
                </Button>
              )}
              {(gameMessage?.type === 'success' || gameMessage?.type === 'error') && !isVisualizing && (
                 <Button 
                  onClick={handleStartUserPlay} 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground animate-pulse"
                >
                  Play Again?
                </Button>
              )}
            </div>
            
            {/* Timer Display */}
            {timerActive || elapsedTime > 0 ? (
              <div className="flex items-center text-lg font-semibold text-primary">
                <Clock className="w-5 h-5 mr-2" />
                Time: {formatTime(elapsedTime)}
              </div>
            ) : null}

            {/* Game Message Display */}
            {gameMessage?.text && (
              <p className={cn(
                "text-center font-medium px-4 py-2 rounded-md",
                gameMessage.type === 'success' && 'bg-green-100 text-green-700 animate-bounce',
                gameMessage.type === 'error' && 'bg-red-100 text-red-700 animate-shake', // A shake animation would be cool
                gameMessage.type === 'info' && 'bg-blue-100 text-blue-700'
              )}>
                {gameMessage.text}
              </p>
            )}
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
                  className={cn(`flex items-center justify-center border border-border 
                              transition-colors duration-100 ease-in-out
                              ${(rowIndex + colIndex) % 2 === 0 ? 'bg-secondary/50' : 'bg-background/80'}
                              ${cell.isPath ? 'bg-accent/40' : ''}
                              ${cell.isCurrent ? '!bg-accent' : ''}
                              ${isBoardInteractable && cell.step === null ? 'cursor-pointer hover:bg-primary/20' : ''}
                              ${isBoardInteractable && cell.step !== null ? 'cursor-not-allowed' : ''}
                              text-sm md:text-base lg:text-lg font-mono`
                  )}
                  style={{ aspectRatio: '1 / 1' }}
                  onClick={() => handleCellClick({ x: cell.x, y: cell.y })}
                  aria-label={`Cell ${cell.x + 1}, ${cell.y + 1}${cell.step ? `, step ${cell.step}` : ''} ${isBoardInteractable && cell.step === null ? ', clickable' : ''}`}
                  role={isBoardInteractable ? "button" : "gridcell"}
                  tabIndex={isBoardInteractable && cell.step === null ? 0 : -1}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && isBoardInteractable && cell.step === null) {
                      handleCellClick({ x: cell.x, y: cell.y });
                    }
                  }}
                >
                  {cell.isCurrent ? (
                    <ChessKnightIcon className="w-3/5 h-3/5 text-accent-foreground animate-pulse" />
                  ) : cell.step !== null ? (
                     <span className={cn(
                       "font-bold",
                       cell.isPath ? 'text-accent-foreground' : ((rowIndex + colIndex) % 2 === 0 ? 'text-secondary-foreground' : 'text-foreground')
                     )}>
                      {cell.step}
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>

          {/* AI Controls - de-emphasized */}
          {!isUserPlaying && (
            <details className="mt-6 text-center text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                AI Controls (Advanced)
              </summary>
              <div className="mt-2 flex flex-col items-center gap-2">
                <Button 
                  onClick={handleStartVisualization} 
                  disabled={isVisualizing || isUserPlaying} 
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground"
                >
                  {isVisualizing ? 'Visualizing AI...' : "Show AI Solution"}
                </Button>
              </div>
            </details>
          )}

        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground">
        <p>
          {!isGameActive && !gameMessage?.text && "Select board size and start playing, or see an AI solution."}
          {isUserPlaying && !gameMessage?.text && "Click a square to move the knight."}
        </p>
      </footer>
    </div>
  );
};

export default KnightTourPage;

    
