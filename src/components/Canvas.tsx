import React, {FC, useEffect, useRef, useState} from 'react';
import {CanvasModel} from "../models/CanvasModel";

const Canvas: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [canvas, setCanvas] = useState<CanvasModel>({} as CanvasModel);

    useEffect(() => {
        if( canvasRef.current ) {
            const context = canvasRef.current.getContext('2d');

            if ( context !== null ) {
                setCanvas(new CanvasModel(canvasRef.current, context))
            }
        }
    }, []);

    return (
        <>
            <div style={{border: '1px solid black', width: 600}}>
                <canvas ref={canvasRef} width={600} height={600}/>
            </div>
            <button onClick={ () => canvas.collapse() }>collapse</button>
        </>
    );
};

export default Canvas;