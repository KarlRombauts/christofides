import { useCallback, useState } from 'react';
import { PositionedVertex } from '../model/graphModel';

export function useGraphInteraction(initial: PositionedVertex[]) {
  const [verts, setVerts] = useState<PositionedVertex[]>(initial);

  const addVertex = useCallback((x: number, y: number) => {
    setVerts((vs) => {
      const id = vs.reduce((m, v) => Math.max(m, v.id), -1) + 1;
      return [...vs, { id, x, y }];
    });
  }, []);

  const moveVertex = useCallback((id: number, x: number, y: number) => {
    setVerts((vs) => vs.map((v) => (v.id === id ? { ...v, x, y } : v)));
  }, []);

  const deleteVertex = useCallback((id: number) => {
    setVerts((vs) => vs.filter((v) => v.id !== id));
  }, []);

  const reset = useCallback((next: PositionedVertex[]) => setVerts(next), []);

  return { verts, addVertex, moveVertex, deleteVertex, setVerts, reset };
}
