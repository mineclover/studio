
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChessKnightIcon } from '@/components/icons/ChessKnightIcon';
import { cn } from '@/lib/utils';
import { Clock, Bot, Info, Gamepad2, RefreshCcw, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  const [isUserPlaying, setIsUserPlaying] = useState<boolean>(false);
  const [userPath, setUserPath] = useState<{ x: number; y: number }[]>([]);
  const [userCurrentPosition, setUserCurrentPosition] = useState<{ x: number; y: number } | null>(null);

  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0); 

  const [gameMessage, setGameMessage] = useState<GameMessage>({ type: null, text: null });
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
    setGameMessage({ type: null, text: null });
  };

  const resetToInitialState = () => {
    setIsUserPlaying(false);
    setIsVisualizing(false);
    setTourPath([]);
    setCurrentStep(0);
    setBoard(initializeBoard(boardSize)); 
    resetUserPlayState(false); 
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
    setTimerActive(false); 
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
    setGameMessage({ type: 'info', text: 'AI is searching for a solution...' });

    const foundPath = findTour(boardSize);
    if (foundPath) {
      setTourPath(foundPath);
      setGameMessage({ type: 'info', text: `AI found a tour! Starting visualization.` });
    } else {
      setTourPath([]);
      setIsVisualizing(false);
      setGameMessage({ type: 'error', text: `AI couldn't find a tour for ${boardSize}x${boardSize} from (0,0).` });
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
      setGameMessage({ type: null, text: null }); 
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
        setUserPath(newPath); 
        setBoard(newBoard);
        setUserCurrentPosition(clickedCellCoords);
        setGameMessage({ type: null, text: null }); 
        
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
          }
        }
      } else {
        setGameMessage({ type: 'error', text: null }); 
      }
    }
  };
  
  const showStartOverlay = !isUserPlaying && !isVisualizing && gameMessage.type === null;
  const isBoardInteractable = isUserPlaying && !isVisualizing;
  const isGameOverState = (!isUserPlaying && gameMessage.type === 'error' && !timerActive) || 
                          (isUserPlaying && gameMessage.type === 'error' && !timerActive);


  let footerText = "";
  if (showStartOverlay) {
    // Footer not very relevant when overlay is up
  } else if (isGameOverState) {
    footerText = `Stuck! ${userPath.length} moves. Try a new game?`;
  } else if (gameMessage.type === 'success') {
    footerText = `Victory! ${userPath.length} moves in ${formatTime(elapsedTime)}. Play again?`;
  } else if (isUserPlaying) {
    if (userPath.length === 0) {
      footerText = "Click a square to start your knight's journey!";
    } else {
      footerText = "Your turn. Make your move.";
    }
  } else if (isVisualizing) {
    footerText = "AI is gracefully navigating the board...";
  } else if (!isUserPlaying && !isVisualizing && gameMessage.type !== 'success' && !isGameOverState) {
    footerText = "Ready for a new challenge or want to see the AI's solution?";
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative bg-background">
      {showStartOverlay && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in-50 zoom-in-90 rounded-2xl">
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
                <Gamepad2 size={40} /> Knight's Quest!
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground pt-2">
                Choose your board and start the adventure.
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
                  <SelectTrigger id="overlay-board-size-select" className="w-[150px] text-lg py-6 bg-card text-card-foreground rounded-xl">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
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
                Let's Play!
              </Button>
            </CardContent>
             <CardFooter className="pb-8 text-center text-sm text-muted-foreground">
                <p>May your moves be ever onward!</p>
            </CardFooter>
          </Card>
        </div>
      )}

      <Card className={cn(
          "w-full max-w-2xl shadow-xl transition-all duration-500 ease-out rounded-2xl relative", 
          showStartOverlay && "opacity-0 pointer-events-none scale-95",
          !showStartOverlay && "opacity-100 scale-100",
          gameMessage.type === 'success' && "game-success-card",
          gameMessage.type === 'error' && !timerActive && "game-error-card animate-shake" 
      )}>
        <CardHeader className="relative">
          <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 text-muted-foreground hover:text-primary p-1 rounded-full z-10"
                aria-label="How to Play"
              >
                <HelpCircle className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">How to Play Knight's Quest</DialogTitle>
              </DialogHeader>
              <div className="pt-4 space-y-3 text-sm text-muted-foreground text-left max-h-[65vh] overflow-y-auto">
                <p><strong>Objective:</strong> Visit every square on the board exactly once using standard knight moves.</p>
                <div>
                  <strong>Starting the Game:</strong>
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                    <li>Select your desired board size on the initial screen (when the game first loads or after a reset).</li>
                    <li>Click the "Let's Play!" button.</li>
                    <li>On the board, click any square to place your knight. This will also start the timer.</li>
                  </ul>
                </div>
                <div>
                  <strong>Making a Move:</strong>
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                    <li>A knight moves in an "L" shape: two squares in one direction (horizontally or vertically) and then one square perpendicularly.</li>
                    <li>Click on a valid (unvisited, L-shape) destination square to move your knight.</li>
                  </ul>
                </div>
                <div>
                  <strong>Winning the Game:</strong>
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                    <li>Successfully visit all squares on the board. A success message will appear.</li>
                  </ul>
                </div>
                <div>
                  <strong>Game Over (Stuck):</strong>
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                    <li>The game ends if you reach a position where no more valid knight moves are possible. The board will indicate this, and a "Stuck!" message will appear in the footer.</li>
                  </ul>
                </div>
                <div>
                  <strong>AI Solver:</strong>
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                    <li>If you're curious or stuck, you can watch the AI find a solution.</li>
                    <li>When no game is active (e.g., after a reset, or on first load before playing), an "AI Controls" section is available below the board. Click "Show AI Solution".</li>
                  </ul>
                </div>
                <div>
                  <strong>Resetting/Stopping:</strong>
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                    <li>During your game, click the refresh icon (circular arrows) in the top-right corner of the game card to stop the current game and return to the initial state.</li>
                  </ul>
                </div>
                 <div>
                  <strong>Play Again:</strong>
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                     <li>After a game ends (win or lose), a "Play Again?" button will appear.</li>
                  </ul>
                </div>
                <p className="pt-3 font-semibold text-center text-primary">Good luck on your quest!</p>
              </div>
            </DialogContent>
          </Dialog>

          <CardTitle className="text-3xl font-bold text-center text-primary pt-1">Knight's Tour Challenge</CardTitle>
          {isUserPlaying && (
            <Button
                onClick={handleStopUserPlay}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive p-1 rounded-full"
                aria-label="Stop Game and Reset"
            >
                <RefreshCcw className="w-6 h-6" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 mb-6">
            {(timerActive || (elapsedTime > 0 && (gameMessage.type === 'success' || isGameOverState))) && (
              <div className="flex items-center text-2xl font-semibold text-primary mt-2 bg-secondary/70 dark:bg-secondary/50 px-4 py-2 rounded-lg shadow-sm">
                <Clock className="w-7 h-7 mr-2" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            )}

            {gameMessage?.text && (gameMessage.type === 'success' || gameMessage.type === 'info') && ( 
              <p className={cn(
                "text-center font-semibold px-6 py-3 rounded-lg text-lg my-2 shadow-md",
                gameMessage.type === 'success' && 'bg-green-100 text-green-800 dark:bg-green-700/40 dark:text-green-100 animate-bounce text-2xl',
                gameMessage.type === 'info' && 'bg-blue-100 text-blue-800 dark:bg-blue-700/40 dark:text-blue-100',
                (gameMessage.type === 'success') && "min-h-[3em] flex items-center justify-center" 
              )}>
                {gameMessage.text}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {(gameMessage?.type === 'success' || isGameOverState) && !isVisualizing && (
                 <Button 
                  onClick={resetToInitialState} 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground animate-pulse text-xl py-6 px-8 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-transform"
                  size="lg"
                >
                  Play Again?
                </Button>
              )}
            </div>
          </div>

          <div
            className="grid border border-border shadow-md bg-card rounded-xl" 
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
                    `flex items-center justify-center border border-border/50 
                    transition-all duration-200 ease-in-out
                    text-sm md:text-base lg:text-lg font-mono font-semibold`,
                    (rowIndex + colIndex) % 2 === 0 ? 'bg-secondary/60 dark:bg-secondary/40' : 'bg-background/90 dark:bg-background/70',
                    
                    cell.isPath && isGameOverState && gameMessage.type === 'error' ? 'bg-destructive/40 dark:bg-destructive/50' : 
                    (cell.isPath ? 'bg-accent/50 dark:bg-accent/60' : ''),

                    cell.isCurrent && isGameOverState && gameMessage.type === 'error' ? '!bg-destructive/80 dark:!bg-destructive/70' :
                    (cell.isCurrent ? '!bg-accent dark:!bg-accent/90' : ''),

                    isBoardInteractable ?
                      (cell.step === null ? 'cursor-pointer hover:bg-primary/30 dark:hover:bg-primary/40' : 'cursor-not-allowed opacity-70') :
                      'cursor-default',
                    
                    isGameOverState && gameMessage.type === 'error' && cell.step === null ? 'opacity-60 brightness-90' : ''
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
                      isGameOverState && gameMessage.type === 'error' ? 
                        'text-destructive-foreground opacity-90' : 
                        'text-accent-foreground animate-pulse' 
                    )} />
                  ) : cell.step !== null ? (
                     <span className={cn(
                       "font-bold",
                       isGameOverState && gameMessage.type === 'error' ?
                          (cell.isPath ? 'text-destructive-foreground/90 dark:text-destructive-foreground/80' : 'text-foreground/60 dark:text-foreground/50') :
                          (cell.isPath ? 'text-accent-foreground/95 dark:text-accent-foreground' : ((rowIndex + colIndex) % 2 === 0 ? 'text-secondary-foreground/95 dark:text-secondary-foreground' : 'text-foreground/95 dark:text-foreground'))
                     )}>
                      {cell.step}
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>
          
          {!showStartOverlay && !isUserPlaying && !isVisualizing && !(gameMessage.type === 'success' || isGameOverState) && (
            <details className="mt-6 text-center text-sm group">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground inline-flex items-center gap-1 py-1 px-2 rounded-md hover:bg-muted transition-colors">
                <Bot size={16} /> AI Controls <Info size={14} className="opacity-70 group-hover:opacity-100"/>
              </summary>
              <div className="mt-3 flex flex-col items-center gap-2 bg-muted/50 p-3 rounded-lg shadow-sm">
                <Button 
                  onClick={handleStartVisualization} 
                  disabled={isVisualizing || isUserPlaying} 
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg"
                >
                  {isVisualizing ? 'Visualizing AI...' : "Show AI Solution"}
                </Button>
              </div>
            </details>
          )}

        </CardContent>
      </Card>
      {!showStartOverlay && (
        <footer className="mt-8 text-center text-muted-foreground text-base h-8 flex items-center justify-center px-4 py-2 bg-card rounded-lg shadow">
          <p>{footerText}</p>
        </footer>
      )}
    </div>
  );
};

export default KnightTourPage;
