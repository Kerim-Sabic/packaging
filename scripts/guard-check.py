"""Safety regressions prompted by an actual public product sheet."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from backend.main import Proposal, guard

def check(value, quote, text, field='total_mass'):
    p=Proposal(fieldName=field,value=value,unit='g',scope='Tray',documentId='one',pageNumber=1,verbatimSupportingText=quote,status='supported_proposal',reviewNote='')
    return guard([p],{('one',1):text})[0]
assert check('21.38','Mass 21,38 g','Mass 21,38 g').status=='supported_proposal'
assert check('21,38','Mass 21,38 g','Mass 21,38 g').value=='21.38'
assert check('21.38','Mass 121,38 g','Mass 121,38 g').status=='ambiguous'
assert check('40','Minimum -40 C','Minimum -40 C','temperature_min').status=='ambiguous'
assert check('-40','Minimum -40 C','Minimum -40 C','temperature_min').status=='supported_proposal'
assert check('100','Up to 100% recycled content.','Contact supplier for recycled content.','recycled_percent').status=='ambiguous'
assert check('100','100% recyclable','100% recyclable','recycled_percent').status=='ambiguous'
assert check('45','45-55% relative humidity','45-55% relative humidity','temperature_min').status=='ambiguous'
assert check('220','Max. temp. (Celsius) 220 C','Max. temp. (Celsius) 220 C','temperature_max').status=='supported_proposal'
assert check('21','Diameter 21 mm','Diameter 21 mm','total_mass').status=='ambiguous'
assert check('10','Tolerance weight +/- 10%','Tolerance weight +/- 10%','recycled_percent').status=='ambiguous'
print('PASS: decimal commas, numeric boundaries, signed temperatures and unsupported recycled claims')
