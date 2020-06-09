const urls = ["https://casecomp.konnectrv.io/movie", "https://casecomp.konnectrv.io/show"];

// async function getAllUrls(urls) {
//     try {
//         let data = await Promise.all(
//             urls.map(url => fetch(url).then(
//                     (response) => response.json()
//                 )
//             )
//         )
//         return(data);
//     } catch (error) {
//         console.log(error)
//         throw(error)
//     }
// }

// let responses = await getAllUrls(urls)
// console.log("these are the responses: ", responses)

Promise.all([
	fetch('https://casecomp.konnectrv.io/movie'),
	fetch('https://casecomp.konnectrv.io/show')
]).then(function (responses) {
    return responses.map(function ( response) {
        console.log(response.json());
        return response.json();
    });
}).then(function (data) {
    console.log(data)
    console.log(data[0]);
});