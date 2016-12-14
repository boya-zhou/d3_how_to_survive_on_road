# -*- coding: utf-8 -*-
"""
Created on Thu Nov  3 16:38:59 2016

@author: liangdarien
"""

import pandas as pd
import numpy as np

def pie2015():
    
    """  First Step: filter the most serious condition  """
   
    person = pd.read_csv("data/FARS2015NationalCSV/person.csv")
    severity = person.loc[:, ['ST_CASE', 'INJ_SEV']]

    # svrtList is the new list storing processed severity
    svrtList = []
    for i in severity['ST_CASE'].unique():
        case = severity.groupby('ST_CASE').get_group(i)
        svrt = list(case['INJ_SEV'])
        svrtList.append([i, svrt.count(4) + svrt.count(6)])
        """
        if len(svrt) == 1:
            svrtList.append([i, svrt[0]])
        # if the serious condition is in [0, 1, 2]
        elif np.max(svrt) in [0, 1, 2]:
            svrtList.append([i, 0])
        # if all is 9 (unknown)
        elif np.sum(svrt) == len(svrt) * 9:
            svrtList.append([i, 9])
        elif 9 in svrt:
            # remove 9
            svrt = list(svrt)
            svrt.remove(9)
            # if 4 or 6 in svrt: fatal
            if 4 in svrt or 6 in svrt:
                svrtList.append([i, 6])
            else:
                # if 3 or 5 is the max in svrt: serious
                svrtList.append([i, 5])
        else:
            # if 4 or 6 in svrt: fatal
            if 4 in svrt or 6 in svrt:
                svrtList.append([i, 6])
            else:
                # if 3 or 5 is the max in svrt: serious
                svrtList.append([i, 5])
        """
                
    with open("data/svrt.csv", "w") as out:
        out.write("ST_CASE,FATAL_COUNT\n")
        for svrt in svrtList:
            out.write("%d,%d\n" % (svrt[0], svrt[1]))
    
    
    """

    severity = pd.read_csv("data/svrt.csv")
    severity['FATAL_COUNT'].value_counts().to_csv("data/severity.csv")

    """ 


def byType():
    
    """
    vehicle = pd.read_csv("data/FARS2015NationalCSV/vehicle.csv")
    vehicleType = vehicle.loc[:, ['ST_CASE', 'BODY_TYP']]
    
    typList = []
    for i in vehicleType['ST_CASE'].unique():
        case = vehicleType.groupby('ST_CASE').get_group(i)
        typ = np.array(case['BODY_TYP'])
        typList.append([i, typ[0]])
    
    with open("data/type.csv", "w") as out:
        out.write("ST_CASE,BODY_TYP\n")
        for tpy in typList:
            out.write("%d,%d\n" % (tpy[0], tpy[1]))
            
            
    
    accident = pd.read_csv("data/FARS2015NationalCSV/accident.csv")
    time = accident.loc[:,['ST_CASE', 'DAY_WEEK', 'HOUR']]    
    vehicleType = pd.read_csv("data/type.csv")
    severity = pd.read_csv("data/svrt.csv")
    time['BODY_TYP'] = vehicleType['BODY_TYP']
    
    time['FATAL_COUNT'] = ""
    time1 = time[severity['FATAL_COUNT'] == 1]
    time1.loc[:,['FATAL_COUNT']] = 1
    time2 = time[severity['FATAL_COUNT'] == 2]
    time2['FATAL_COUNT'] = 2
    time3 = time[severity['FATAL_COUNT'] > 2]
    time3['FATAL_COUNT'] = ">2"
    
    timeFinal = pd.concat([time1, time2,time3])
    timeFinal.to_csv('data/driveType.csv', index=False)
    """
    
    weather = pd.read_csv("data/weather3.csv")
    weather['BODY_TYP2'] = ''
    weather = weather[weather['BODY_TYP'] != 98]
    weather = weather[weather['BODY_TYP'] != 99]
    sedan = weather[weather['BODY_TYP'] < 10]
    sedan['BODY_TYP2'] = 1
    weather = weather[weather['BODY_TYP'] >= 10]
    utility = weather[weather['BODY_TYP'] < 20]
    utility['BODY_TYP2'] = 2
    weather = weather[weather['BODY_TYP'] >= 20]
    van = weather[weather['BODY_TYP'] < 30]
    van['BODY_TYP2'] = 3
    weather = weather[weather['BODY_TYP'] >= 30]
    light = weather[weather['BODY_TYP'] < 50]
    light['BODY_TYP2'] = 4
    weather = weather[weather['BODY_TYP'] >= 50]
    bus = weather[weather['BODY_TYP'] < 60]
    bus['BODY_TYP2'] = 5
    weather = weather[weather['BODY_TYP'] >= 60]
    truck = weather[weather['BODY_TYP'] < 80]
    truck['BODY_TYP2'] = 6
    weather = weather[weather['BODY_TYP'] >= 80]
    other = weather[weather['BODY_TYP'] < 98]
    other['BODY_TYP2'] = 5
    
    vehicleType = pd.concat([sedan, utility, van, light, bus, truck, other])
    vehicleType.to_csv('data/type3.csv', index=False)

def byWeather():
    """
    accident = pd.read_csv("data/FARS2015NationalCSV/accident.csv")
    weather0 = accident.loc[:,['ST_CASE', 'WEATHER']]
    vehicleType = pd.read_csv("data/driveType.csv")
    weather = pd.merge(vehicleType, weather0, on='ST_CASE')
    weather.to_csv('data/weather0.csv', index=False)
    x
    weather = pd.read_csv("data/weather1.csv")
    # remove weather 6,7,8,11,12
    weather = weather[weather['WEATHER'] != 6]
    weather = weather[weather['WEATHER'] != 7]
    weather = weather[weather['WEATHER'] != 8]
    weather = weather[weather['WEATHER'] != 11]
    weather = weather[weather['WEATHER'] != 12]
    weather = weather[weather['WEATHER'] != 98]
    weather = weather[weather['WEATHER'] != 99]
    weather.to_csv('data/weather2.csv', index=False)
    """
    weather = pd.read_csv("data/weather2.csv")
    count = pd.read_csv("data/svrt.csv")
    weather2 = pd.merge(weather, count, on='ST_CASE')
    weather2.to_csv('data/weather3.csv', index=False)

def byBehave():
    caidan = pd.read_csv("data/behavior.csv")
    caidan1 = caidan.loc[:, ['ST_CASE', 'STATE', 'SPEEDREL', 'MDRDSTRD']]
    caidan1['SPEEDREL2'] = ''
    caidan1['MDRDSTRD2'] = ''
    # concat speed, get caidan2
    unspeed = caidan1[caidan1['SPEEDREL'] == 0]
    unspeed['SPEEDREL2'] = 0
    speed = caidan1[caidan1['SPEEDREL'] != 0]
    speed['SPEEDREL2'] = 1
    caidan2 = pd.concat([unspeed, speed])
    # concat distract, 0 and 99 considered as not distracted, others are distracted
    distract0 = caidan2[caidan2['MDRDSTRD'] == 0]
    distract0.loc[:, ['MDRDSTRD2']] = 0
    distract1 = caidan2[caidan2['MDRDSTRD'] != 0]
    distract99 = distract1[distract1['MDRDSTRD'] == 99]
    distract99.loc[:, ['MDRDSTRD2']] = 0
    distractOthers = distract1[distract1['MDRDSTRD'] != 99]
    distractOthers.loc[:, ['MDRDSTRD2']] = 1
    caidan3 = pd.concat([distract0, distract99, distractOthers])
    
    type3 = pd.read_csv("data/type3.csv")
    caidan2 = pd.merge(type3, caidan3, on='ST_CASE')
    caidan2.to_csv('data/final0.csv', index=False)
        
if __name__ == '__main__':
    #pie2015()
    #byType()
    #byWeather()
    byBehave()
    
    
    
    