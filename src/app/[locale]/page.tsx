
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
  const { toast } = useToast();

  const [isUserPlaying, setIsUserPlaying] = useState<boolean>(false);
  const [userPath, setUserPath] = useState<{ x: number; y: number }[]>([]);
  const [userCurrentPosition, setUserCurrentPosition] = useState<{ x: number; y: number } | null>(null);

  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0); 

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
    if (!isUserPlaying && !isVisualizing && gameMessage.type === null) {
        setBoard(initializeBoard(boardSize));
        resetUserPlayState(false); 
    }
  }, [boardSize, initializeBoard, isUserPlaying, isVisualizing, gameMessage.type]);


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
    setElapsedTime(0);
    setStartTime(null);
    setTimerActive(false);
    if (notifyStart) {
       setGameMessage({ type: 'info', text: 'Click a square to place your knight and start the tour.' });
    } else {
       setGameMessage({ type: null, text: null });
    }
  };

  const resetToInitialState = () => {
    setIsUserPlaying(false);
    setIsVisualizing(false);
    setTourPath([]);
    setCurrentStep(0);
    setBoard(initializeBoard(boardSize)); 
    resetUserPlayState(false); 
    // This will make showStartOverlay true because gameMessage.type becomes null
  };

  const handleStartUserPlayFromOverlay = () => {
    setIsUserPlaying(true);
    setIsVisualizing(false); 
    setTourPath([]); 
    setCurrentStep(0); 
    setBoard(initializeBoard(boardSize)); 
    resetUserPlayState(true); 
  };

  const handleStopUserPlay = () => {
    // User explicitly stops, go back to overlay
    setTimerActive(false); 
    if (userPath.length > 0 && userPath.length < boardSize * boardSize) {
        // Temporary message before overlay takes over
        toast({ title: "Game Stopped", description: `You made ${userPath.length} moves in ${formatTime(elapsedTime)}.`});
    }
    resetToInitialState();
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
    if (isUserPlaying) setIsUserPlaying(false); 
    resetUserPlayState(false); 
    
    setIsVisualizing(true);
    setCurrentStep(0);
    const newBoard = initializeBoard(boardSize);
    setBoard(newBoard);
    setGameMessage({ type: 'info', text: 'AI is thinking...' });

    const foundPath = findTour(boardSize);
    if (foundPath) {
      setTourPath(foundPath);
      setGameMessage({ type: 'info', text: `AI found a tour! Starting visualization.` });
    } else {
      setTourPath([]);
      setIsVisualizing(false);
      setGameMessage({ type: 'error', text: `AI could not find a tour for a ${boardSize}x${boardSize} board from (0,0).` });
    }
  };

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
      }, 300); 
      return () => clearTimeout(timer);
    } else if (isVisualizing && !isUserPlaying && currentStep >= tourPath.length && tourPath.length > 0) {
      setIsVisualizing(false);
      setGameMessage({ type: 'info', text: `AI Tour Complete! Visited all ${boardSize*boardSize} squares.` });
    }
  }, [isVisualizing, currentStep, tourPath, boardSize, isUserPlaying]); 


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

    if (!userCurrentPosition) { 
      newBoard[clickedCellCoords.y][clickedCellCoords.x].step = 1;
      newBoard[clickedCellCoords.y][clickedCellCoords.x].isCurrent = true;
      
      setBoard(newBoard);
      setUserCurrentPosition(clickedCellCoords);
      setUserPath([clickedCellCoords]);
      setStartTime(Date.now());
      setTimerActive(true);
      setGameMessage({ type: 'info', text: "Knight placed. Make your next move." });
    } else { 
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
        
        if (newPath.length === boardSize * boardSize) {
          setTimerActive(false);
          setIsUserPlaying(false); 
          setGameMessage({ type: 'success', text: `Congratulations! You completed the Knight's Tour in ${formatTime(elapsedTime)}!` });
        } else {
          const availableMoves = getValidMovesFromPosition(targetX, targetY, newBoard, boardSize);
          if (availableMoves.length === 0) {
            setTimerActive(false);
            setIsUserPlaying(false); 
            setGameMessage({ type: 'error', text: `Game Over! No more valid moves. You made ${newPath.length} moves in ${formatTime(elapsedTime)}.` });
            // Board remains visible, user can see the final state. "Play Again?" will appear.
          } else {
            setGameMessage({ type: 'info', text: 'Good move!' });
          }
        }
      } else {
        toast({
          title: "Invalid Move",
          description: "Please choose a valid, unvisited square according to the Knight's L-shaped move.",
          variant: "destructive",
          duration: 3000,
        });
        setGameMessage({ type: 'error', text: "Invalid move. Choose a valid, unvisited square." });
      }
    }
  };
  
  const showStartOverlay = !isUserPlaying && !isVisualizing && gameMessage.type === null;
  const isBoardInteractable = isUserPlaying && !isVisualizing;
  const isGameOverState = !isUserPlaying && gameMessage.type === 'error';


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      {showStartOverlay && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in-50 zoom-in-90">
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-4xl font-bold text-primary">Begin Your Knight's Quest!</CardTitle>
              <CardDescription className="text-lg text-muted-foreground pt-2">
                Select board size and embark on the tour.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-8 py-10">
              <div className="flex items-center gap-4">
                <Label htmlFor="overlay-board-size-select" className="text-xl font-medium">Board Size:</Label>
                <Select
                  value={boardSize.toString()}
                  onValueChange={(value) => {
                    setBoardSize(parseInt(value));
                  }}
                >
                  <SelectTrigger id="overlay-board-size-select" className="w-[150px] text-lg py-6 bg-card text-card-foreground">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 6, 7, 8, 9, 10].map((size) => (
                      <SelectItem key={size} value={size.toString()} className="text-lg">
                        {size}x{size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleStartUserPlayFromOverlay}
                size="lg"
                className="w-full max-w-xs bg-accent hover:bg-accent/90 text-accent-foreground text-2xl py-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
              >
                Play Knight's Tour
              </Button>
            </CardContent>
             <CardFooter className="pb-8 text-center text-sm text-muted-foreground">
                <p>Good luck, brave knight!</p>
            </CardFooter>
          </Card>
        </div>
      )}

      <Card className={cn(
          "w-full max-w-2xl shadow-xl transition-all duration-500 ease-out",
          showStartOverlay && "opacity-0 pointer-events-none scale-95",
          !showStartOverlay && "opacity-100 scale-100",
          gameMessage.type === 'success' && "game-success-card",
          gameMessage.type === 'error' && "game-error-card" // This will apply on game over
      )}>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Knight's Tour Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 mb-6">
            {(timerActive || (elapsedTime > 0 && (gameMessage.type === 'success' || gameMessage.type === 'error'))) && (
              <div className="flex items-center text-2xl font-semibold text-primary mt-2">
                <Clock className="w-7 h-7 mr-2" />
                Time: {formatTime(elapsedTime)}
              </div>
            )}

            {gameMessage?.text && (
              <p className={cn(
                "text-center font-semibold px-6 py-3 rounded-lg text-lg my-2",
                gameMessage.type === 'success' && 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-200 animate-bounce text-2xl',
                gameMessage.type === 'error' && 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-200 animate-shake text-2xl',
                gameMessage.type === 'info' && 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-200',
                (gameMessage.type === 'success' || gameMessage.type === 'error') && "min-h-[3em] flex items-center justify-center" 
              )}>
                {gameMessage.text}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {isUserPlaying && (
                 <Button 
                  onClick={handleStopUserPlay} 
                  variant="destructive"
                  size="lg"
                  className="text-lg py-5 px-7"
                >
                  Stop Playing
                </Button>
              )}
              {/* "Play Again?" button shows on success OR error, when not visualizing */}
              {(gameMessage?.type === 'success' || gameMessage?.type === 'error') && !isVisualizing && (
                 <Button 
                  onClick={resetToInitialState} 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground animate-pulse text-xl py-6 px-8 rounded-lg"
                  size="lg"
                >
                  Play Again?
                </Button>
              )}
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
                  className={cn(
                    `flex items-center justify-center border border-border 
                    transition-colors duration-200 ease-in-out
                    text-sm md:text-base lg:text-lg font-mono`,
                    // Base cell background
                    (rowIndex + colIndex) % 2 === 0 ? 'bg-secondary/50 dark:bg-secondary/30' : 'bg-background/80 dark:bg-background/60',
                    
                    // Path styling
                    cell.isPath && isGameOverState ? 'bg-destructive/30 dark:bg-destructive/40' : 
                    (cell.isPath ? 'bg-accent/40 dark:bg-accent/50' : ''),

                    // Current position styling
                    cell.isCurrent && isGameOverState ? '!bg-destructive/70 dark:!bg-destructive/60' :
                    (cell.isCurrent ? '!bg-accent dark:!bg-accent/80' : ''),

                    // Cursor and hover
                    isBoardInteractable ?
                      (cell.step === null ? 'cursor-pointer hover:bg-primary/20 dark:hover:bg-primary/30' : 'cursor-not-allowed') :
                      'cursor-default',

                    // General game over appearance for unvisited cells
                    isGameOverState && cell.step === null ? 'opacity-50 brightness-90' : ''
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
                    <ChessKnightIcon className={cn(
                      "w-3/5 h-3/5",
                      isGameOverState ? 
                        'text-destructive-foreground opacity-90' : // Stuck knight
                        'text-accent-foreground animate-pulse' // Active/successful knight
                    )} />
                  ) : cell.step !== null ? (
                     <span className={cn(
                       "font-bold",
                       isGameOverState ?
                          (cell.isPath ? 'text-destructive-foreground/80 dark:text-destructive-foreground/70' : 'text-foreground/50 dark:text-foreground/40') :
                          (cell.isPath ? 'text-accent-foreground/90 dark:text-accent-foreground' : ((rowIndex + colIndex) % 2 === 0 ? 'text-secondary-foreground/90 dark:text-secondary-foreground' : 'text-foreground/90 dark:text-foreground'))
                     )}>
                      {cell.step}
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>
          
          {!showStartOverlay && !isUserPlaying && !isVisualizing && !(gameMessage.type === 'success' || gameMessage.type === 'error') && (
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
      {!showStartOverlay && (
        <footer className="mt-8 text-center text-muted-foreground">
          <p>
            {isUserPlaying && userPath.length === 0 && "Click a square to place your knight."}
            {isUserPlaying && userPath.length > 0 && !gameMessage.text?.toLowerCase().includes('game over') && !gameMessage.text?.toLowerCase().includes('congratulations') && "Continue your tour, brave knight!"}
            {isVisualizing && "Watch the AI conquer the board!"}
          </p>
        </footer>
      )}
    </div>
  );
};

export default KnightTourPage;
