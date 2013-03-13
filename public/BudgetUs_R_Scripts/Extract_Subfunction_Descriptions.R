setwd("/Users/raulfoo/Desktop")

labels = readLines("temp.txt")
dat = read.csv("ComprehensiveBudget.csv",stringsAsFactors=F)


#clean labels
removes = grep("Appendix|Budget Functional Classification|GAO-05-734SP Budget Glossary|Function or subfunction",labels)
workLabs = labels[-removes]
#subfunction code column => 8
both = unique(dat[,c(8,9)])
both = both[order(both[,1]),]
sunFunctions = unique(dat[,9])
allCodes = sort(unique(dat[,8]))
catCodes = unique(round(codes,digits=-1))

for(index in 1:nrow(both))

#start = grep(both[index,2],workLabs)[1]
#if(index == 1) start = 0
start = 0
stop = grep(catCodes[(index+1)],workLabs)[1]-1
if(index == nrow(both)) stop = length(workLabs)

workDat = workLabs[start:stop]


catCode = round(both[index,1],digits=-1)
mainStart = grep(catCode,workDat)
mainStop = grep()

if(catCode != catCodeOld){
	workLabs = labels[-c(start:stop)]
	mainStart = grep(catCode,workDat)
	mainStop = grep(both[index,1],workDat)-1
	main = workDat[mainStart:mainStop]
} 
catCodeOld = catCode

