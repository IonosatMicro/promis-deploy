import numbers
import numpy as np

class BaseCalibration:
	"""
    [en]: base class
    [uk]: базовий клас
    """
	def __init__(self, parameters):
		self.parameters = parameters
		return

	def calculate(self, data, *args):
		return

class CoefficientMatrixMultiply(BaseCalibration):
	"""
    [en]: multiplication by matrix of coefficienta (Value * Coef)
    [uk]: множення на матрицю коефіцієнтів (Значення * Коефіцієнт)
    """
	def calculate(self, data, *args):
		if 'convert_matrix' in self.parameters:
			matrix = self.parameters['convert_matrix'][args[0]]
			data = np.dot(matrix, data)
		'''
		#check matrix
		res2 = [matrix[0][0]*data[0] + matrix[0][1]*data[1] + matrix[0][2]*data[2],  
				matrix[1][0]*data[0] + matrix[1][1]*data[1] + matrix[1][2]*data[2],
				matrix[2][0]*data[0] + matrix[2][1]*data[1] + matrix[2][2]*data[2]]

		print("matrix 00: ", data[0], " ", res2[0])
		'''
		if 'Kp' in self.parameters:
			data = [self.parameters['Kp'] * x for x in data]

		return data

class CoefficientMultiply(BaseCalibration):
	"""
    [en]: multiplication by coefficient (Value * Coef)
    [uk]: множення на коефіцієнт (Значення * Коефіцієнт)
    """
	def calculate(self, data, *args):
		assert('Kp' in self.parameters)
			
		if isinstance(data, numbers.Real):
			data = self.parameters['Kp'] * data
		else:
			data = [self.parameters['Kp'] * x for x in data]

		return data

class TwoToOne(BaseCalibration):
	"""
    [en]: merging two channels into one parameter (Ch1-Ch2)/Coef
    [uk]: перетворення двох каналів в один парметр (канал1-канал2)/коефіцієнт
    """
	def calculate(self, data, *args):
		assert('Kp' in self.parameters)
		return (data[0] - data[1]) * self.parameters['Kp']
