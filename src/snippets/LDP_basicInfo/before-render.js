LDP_basicInfo : function(){
    //Your code goes here
    try {
        const {OpenHours, CloseHours} = wData.wompHealthResponse.locations[0];
        
        if (OpenHours instanceof Array && CloseHours instanceof Array) {
            const noOpenHours = OpenHours.every(e => e === "");
            const noClosedHours = CloseHours.every(e => e === "");
        
            // If both arrays are full of empty strings, set conditional on wData
            // if (noOpenHours && noClosedHours) {
            //     wData.doNotRenderTimes = true;
            // }
        } else {
            // wData.doNotRenderTimes = true;
        }
    } catch (e) {
        console.error(`!!! Error: ${e}`)
    }
}