async function add({x, y}) {
    return {
        sum: Promise.resolve((await x) + (await y)),
    }
}

async function multiply({a, b}) {
    return {
        product: Promise.resolve((await a) * (await b)),
    };
}

function constant({c}) {
    return {
        constant: c,
    };
}

async function wire({sourceToSink, sink}) {
    const sinkObj = {};
    sourceToSink.forEach(([sourceObj, sourceKey, sinkKey]) => {
        sinkObj[sinkKey] = sourceObj[sourceKey];
    });
    return sink(sinkObj);
}

async function main() {
    const two = constant({c: Promise.resolve(2)});
    const four = constant({c: Promise.resolve(4)});

    const multTwoFour = await wire({
        sourceToSink: [
            [two, 'constant', 'a'],
            [four, 'constant', 'b'],
        ],
        sink: multiply,
    });

    const addTwoFour = await wire({
        sourceToSink: [
            [two, 'constant', 'x'],
            [four, 'constant', 'y'],
        ],
        sink: add,
    });

    const addNested = await wire({
        sourceToSink: [
            [multTwoFour, 'product', 'x'],
            [addTwoFour, 'sum', 'y'],
        ],
        sink: add,
    });


    console.log(await multTwoFour.product);
    console.log(await addTwoFour.sum);
    console.log(await addNested.sum);
}

main();