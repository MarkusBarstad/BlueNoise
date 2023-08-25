const
    // toW = (f) => f % W,
    // toH = (f) => ~~(f / W) % W,
    // unFlat = (f) => [toW(f), toH(f)],
    toFlat = (w, h) => h + W * w,

    getBlueNoise = (W, H) => {
        const
            size = W * H,
            res = [],

            bitwiseAbs32 = (n) => {
    			const mask = (n >> 31);
    			return (n ^ mask) - mask;
    		},

            wrappedDist = (a, b, width=W, abs=bitwiseAbs32) => {
    			let distance = abs(a - b);
    			if(distance > (width/2)) distance -= width;
    			return distance;
    		}

        let
            furthestX = (Math.random() * 1) * W,
            furthestY = (Math.random() * 1) * H;

        res.push(furthestX + furthestY * W);

        let
            x = furthestX,
            y = furthestY;

        for (let j = 1; !(j > size); j++) {
            const iterations = j * 16;

            for (let i = 0; i < iterations; i++) {
                let
                    possibleX = (Math.random() * 1) * W,
                    possibleY = (Math.random() * 1) * H;

                if(
                    wrappedDist(possibleX, furthestX) > wrappedDist(x, furthestX) &&
                    wrappedDist(possibleY, furthestY) > wrappedDist(y, furthestY)
                ) {
                    x = possibleX;
                    y = possibleY;
                }
            }

            furthestX = x;
            furthestY = y;

            res.push(
                toFlat(furthestX, furthestY)
            );
        }

        return res;
    },

    buildBuffer = (ctx, W, H) => {
        const
            buffSize = W * H,
            bN = getBlueNoise(W, H),
            buffer = new ArrayBuffer(buffSize * 4),
            perPixel = new Uint32Array(buffer),
            to32 = (r, g, b) => ((255 << 24) | (b << 16) | (g << 8) | r),
            // getR = () => (Math.random() * 255),
            [
                BG_COLOR1,
                BG_COLOR2
            ] = [
            	to32(255,255,255), to32(0,0,0)
            ]

            lerpSingleByte = (index, amount) => ~~(
                ((255 & BG_COLOR1 >> index) * (1 - amount)) +
                ((255 & BG_COLOR2 >> index) * amount)
            ),

            getLerped = (amount) => to32(
                lerpSingleByte(     0,      amount),
                lerpSingleByte(     8,      amount),
                lerpSingleByte(     16,     amount)
            )
        ;

        for(let pos = buffSize; !(pos<0); --pos){
    		perPixel[pos] = getLerped((bN[pos]/buffSize));
        }

        createImageBitmap(
        	new ImageData(
        		new Uint8ClampedArray(buffer),
        		W
    		)
    	).then(
    		value => ctx.transferFromImageBitmap(value)
    	);
    }
;

onmessage = (e) => {
	const { canvas, W, H } = e.data;

    canvas.width = W;
    canvas.height = H;

    buildBuffer(
        canvas.getContext("bitmaprenderer"),
        W,
        H,
        getBlueNoise(W, H)
    );
};