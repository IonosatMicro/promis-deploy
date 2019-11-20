import numbers

class BaseCalibration:
	"""
    [en]: base class
    [uk]: базовий клас
    """
	def __init__(self, parameters):
		self.parameters = parameters
		return

class CoefficientMultiply(BaseCalibration):
	"""
    [en]: multiplication by coefficient (Value * Coef)
    [uk]: множення на коефіцієнт (Значення * Коефіцієнт)
    """
	def calculate(self, data):
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
	def calculate(self, data):
		assert len(self.parameters) > 0
		assert len(data) == 2
		
		return (data[0] - data[1]) / self.parameters[0]
