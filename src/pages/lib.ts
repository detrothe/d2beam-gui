
export function BubbleSort(arr: number[]) {

    let temp: number
    let i: number, j: number

    let len = arr.length
    console.log("BubbleSort, len", len)
    for (i = 0; i < len - 1; i++) {
        for (j = i + 1; j < len; j++) {
            if (arr[i] > arr[j]) {
                temp = arr[i]
                arr[i] = arr[j]
                arr[j] = temp
            }
        }
    }
console.log("sortiert",arr)
}
