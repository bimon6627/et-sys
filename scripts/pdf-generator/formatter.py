import pandas as pd

df = pd.read_csv('file.csv')
colsToDrop = ['Kommentarer fra Hannah', 'kommentar fra konkom v/emma', 'Tidsmerke', 'E-postadresse']
df = df.drop(colsToDrop, axis=1)

newDf = pd.DataFrame(columns=['Forslagsnummer', 'Navn', 'Skole', 'Type endring', 'Punkt', 'Endring', 'Innstilling', 'For', 'Mot', 'Avholdende', 'Til fordel for'])

newDf['Forslagsnummer'] = df['Auto Merge Field']
newDf['Navn'] = df['Navn']
newDf['Skole'] = df['Skole']
newDf['Type endring'] = df['Type endring']
newDf['Punkt'] = df['Punkt']
newDf['Endring'] = df['Endring ']

def getVoteNumbers(innstilling):
    
    length = len(innstilling)
    numbers = [0, 0, 0]
    index = 0
    for i in range(length - 1, -1, -1):
        if len(numbers) < 3:
            char = innstilling[i]
            try:
                numbers[index] = int(char)
                index += 1
            except:
                continue
        else:
            break
    
    vote = [numbers[2], numbers[1], numbers[0]]
    

    return vote

def setVoteNumbers(df, rowIndex, votes):
    df.loc[rowIndex, 'For'] = votes[0]
    df.loc[rowIndex, 'Mot'] = votes[1]
    df.loc[rowIndex, 'Avholdende'] = votes[2]

def isInt(string):
    try:
        int(string)
        return True
    except:
        return False

def getAlternative(innstilling):
    index = 0
    for char in innstilling:
        if char == "F":
            startIndex = index
            endIndex = 0

            for i in range(startIndex, len(innstilling)):
                newChar = innstilling[i]
                if (newChar == "(" or isInt(newChar)):
                    endIndex = i - 1
                    break

            return (innstilling[startIndex:endIndex])

        index += 1
    return ""

for row in df.iterrows():
    innstilling = row[1]['Innstilling']
    index = row[0]
    if "Ikke" in innstilling or "realitetsbehandlet" in innstilling:
        newDf.loc[index, 'Innstilling'] = "IRH - Ikke realitetsbehandlet"
    elif "vedtatt" in innstilling:
        newDf.loc[index, 'Innstilling'] = "V - Innstilt vedtatt"
        setVoteNumbers(newDf, index, getVoteNumbers(innstilling))
    elif "avvist" in innstilling or "avist" in innstilling:
        if " til " in innstilling or " fordel " in innstilling:
            newDf.loc[index, 'Innstilling'] = "AV - Innstilt avvist til fordel for"
            setVoteNumbers(newDf, index, getVoteNumbers(innstilling))
            newDf.loc[index, 'Innstilling'] = getAlternative(innstilling)
        else:
            newDf.loc[index, 'Innstilling'] = "A - Innstilt avvist"
            setVoteNumbers(newDf, index, getVoteNumbers(innstilling))
    elif "Ivaretatt" in innstilling:
        newDf.loc[index, 'Innstilling'] = "I - Ivaretatt"
    else:
        newDf.loc[index, 'Innstilling'] = "IFV - Ingen forslag til vedtak"
        setVoteNumbers(newDf, index, getVoteNumbers(innstilling))

newDf.to_excel('output.xlsx', 'Maskinlesbart format', index=False)
