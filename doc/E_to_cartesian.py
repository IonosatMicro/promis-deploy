import numpy as np

# test comment
# Calculation of inverse matrix coefficients for calculating Ex, Ey, Ez components from ΔV1, ΔV2, ΔV3

x1 = 2.687
y1 = 2.687
z1 = 0.340

x2 = -2.828
y2 = -2.828
z2 = 0.260

x3 = 0.168
y3 = -0.675
z3 = 4.280

x4 = 2.100
y4 = -3.300
z4 = 0.375

det = ((x4 - x1)*(y2 - y1)*(z3 - z1) - (x4 - x1)*(y3 - y1)*(z2 - z1) +
       (x3 - x1)*(y4 - y1)*(z2 - z1) - (x2 - x1)*(y4 - y1)*(z3 - z1) +
       (x2 - x1)*(y3 - y1)*(z4 - z1) - (x3 - x1)*(y2 - y1)*(z4 - z1))

m11 = ((y2 - y1)*(z3 - z1) - (y3 - y1)*(z2 - z1)) / det
m12 = ((y3 - y1)*(z4 - z1) - (y4 - y1)*(z3 - z1)) / det
m13 = ((y4 - y1)*(z2 - z1) - (y2 - y1)*(z4 - z1)) / det

print(m11, m12, m13)


A = np.array([[x4-x1, y4-y1, z4-z1], [x2-x1, y2-y1, z2-z1], [x3-x1, y3-y1, z3-z1]])
A_inv = np.linalg.inv(A)

print(A_inv)
# Out:
# [[ 0.18607253, -0.19853245, -0.00568404]
#  [-0.18550208,  0.0188171,   0.00202993]
#  [-0.0393252,  -0.11087313,  0.25190521]]

A2 = np.array([[x1-x3, y1-y3, z1-z3], [x2-x3, y2-y3, z2-z3], [x4-x3, y4-y3, z4-z3]])
A2_inv = np.linalg.inv(A2)

print(A2_inv)
# Out:
# [[ 0.01814397, -0.19853245,  0.18607253]
#  [ 0.16465504,  0.0188171,  -0.18550208]
#  [-0.10170687, -0.11087313, -0.0393252 ]]
