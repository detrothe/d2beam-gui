

export function cholesky(a: number[][], b: number[], n: number, flag: number) {

    let i = 0, j = 0, k = 0;
    let s = 0.0;


    switch (flag) {

        case 1:
            for (i = 0; i < n; ++i) {

                if (a[i][i] <= 0.0)
                    return i;                // Zeilenummer zurückgeben
                else {
                    a[i][i] = Math.sqrt(a[i][i]);
                    for (k = i + 1; k < n; ++k) {
                        a[i][k] /= a[i][i];
                    }
                    for (j = i + 1; j < n; ++j) {
                        for (k = j; k < n; ++k) {
                            a[j][k] -= a[i][j] * a[i][k];
                        }
                    }
                }
            }
            return 0;

        case 2:
            for (k = 0; k < n; k++) {
                s = b[k];
                for (i = 0; i < k; ++i) {
                    s -= a[i][k] * b[i];
                }
                b[k] = s / a[k][k];
            }

            //   for ( i = 0; i < n; i++)
            //   {
            //     printf("b(%i)= %lf\n",i,b[i]);
            //   }

            for (i = n - 1; i >= 0; --i) {
                s = b[i];
                for (k = i + 1; k < n; ++k) {
                    s -= a[i][k] * b[k];
                }
                b[i] = s / a[i][i];
            }

            return 0;

        default:
            return -1;
    }
}
