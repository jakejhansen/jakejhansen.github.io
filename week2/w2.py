import matplotlib.pyplot as plt
import numpy as np

data = np.genfromtxt("w2_presidents", skip_header=True)

plt.hist(data)
plt.show()