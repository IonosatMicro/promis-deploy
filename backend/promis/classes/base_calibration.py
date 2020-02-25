import numbers

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
		assert len(self.parameters) > 0
		if (args[0] == "EZ1"):
			start_idx = 0
		else:
			start_idx = 9

		return [(self.parameters[start_idx+0]*data[0] + self.parameters[start_idx+1]*data[1] + self.parameters[start_idx+2]*data[2]) * self.parameters[-1],  
				(self.parameters[start_idx+3]*data[0] + self.parameters[start_idx+4]*data[1] + self.parameters[start_idx+5]*data[2]) * self.parameters[-1],
				(self.parameters[start_idx+6]*data[0] + self.parameters[start_idx+7]*data[1] + self.parameters[start_idx+8]*data[2]) * self.parameters[-1]]

class CoefficientMultiply(BaseCalibration):
	"""
    [en]: multiplication by coefficient (Value * Coef)
    [uk]: множення на коефіцієнт (Значення * Коефіцієнт)
    """
	def calculate(self, data, *args):
		assert len(self.parameters) > 0
		if isinstance(data, numbers.Real):
			return self.parameters[0] * data
		else:
			return [self.parameters[0] * x for x in data]

class TwoToOne(BaseCalibration):
	"""
    [en]: merging two channels into one parameter (Ch1-Ch2)/Coef
    [uk]: перетворення двох каналів в один парметр (канал1-канал2)/коефіцієнт
    """
	def calculate(self, data, *args):
		assert len(self.parameters) > 0
		assert len(data) == 2
		
		return (data[0] - data[1]) / self.parameters[0]
