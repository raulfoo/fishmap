#setwd("/Users/raulfoo/Desktop")

#dat = read.csv("ComprehensiveBudget.csv",stringsAsFactors=F)
#dat= dat[,-c(1,3,7,8,11,12)]

#dat = dat[-(which(dat[,3]==0)),]
#dat = dat[is.na(dat[,3])==F,]

#newID = c(1:dim(dat)[1])
#dat[,3] = newID


setwd("/Users/raulfoo/Desktop")

dat = read.csv("ComprehensiveBudget.csv",stringsAsFactors=F)
dat= dat[,-c(1,3,7,8,11,12)]

dat = dat[-(which(dat[,3]==0)),]
dat = dat[is.na(dat[,3])==F,]

newID = c(1:dim(dat)[1])
dat[,3] = newID



temp = cbind(dat[,5],dat[,1],dat[,2],dat[,4],dat[,3],dat[,6])
temp = toupper(temp)
temp = cbind(temp,dat[,7:ncol(dat)]*1000)

dat = temp

#remove duplicates
for(j in 1:nrow(dat)){
	search = dat[j,]
	indices = which(dat[,1]==search[,1]&dat[,2]==search[,2]&dat[,3]==search[,3]&dat[,4]==search[,4])
	if(length(indices)>1){
		removeRows = indices[2:length(indices)]
		sums = as.numeric(apply(dat[indices,7:ncol(dat)],2,sum))
		dat[j,7:ncol(dat)] = sums
		#newRow = c(dat[j,1:6],sums)
		#dat[j,] = newRow
		dat = dat[-removeRows,]		
	}
	if(j%%250 == 0) print(j)
}

names(dat)[1:6] = c("SubFunction","Agency","Bureau","Account","Accunt Number","Spending Type")

write.table(dat,"BudgetUS_Cleaned.txt",sep=",",row.names=F,col.names=F)
#dat = read.table("BudgetUS_Cleaned.txt",sep=",",stringsAsFactors=F)
yearUse = c(1980:2015)

averages = apply(dat[,c(7:ncol(dat))],1,mean)
removePositives = which(averages < 0)
#dat = dat[-removePositives,]

#temp = cbind(dat[,3],dat[,-3])
#dat = temp
output = c()
for(year in yearUse){
	colIndex = which(names(dat)==paste("X",year,sep=""))
	total = sum(as.numeric(dat[,colIndex]))
	print(paste(year,"  :  ",total))
	temp = cbind(dat[,c(1:6)],year,dat[,colIndex]/total,as.integer(dat[,colIndex]),"f")
	names(temp) = NA
	output = rbind(output,temp)
	names(output) = NA
	
	
	
}

for(i in 1:nrow(output)){
	if(output[i,1]=="SOCIAL SECURITY" | output[i,1]=="MEDICARE"){
		output[i,ncol(output)] == "t"	
	}
	
	
}


write.table(output,"BudgetUs_Comprehensive.txt",sep=",",col.names=F,row.names=F)


negatives = which(as.integer(dat[,58])<=0)
checkNeg = dat[negatives,c(1,2,3,4,58)]
categories = as.data.frame(table(checkNeg[,1]))
moneyMadeList = c()
for(i in categories[,1]){
	index = which(checkNeg[,1]==i)
	moneyMade = sum(checkNeg[index,5])*-1
	moneyMadeList = c(moneyMadeList,moneyMade)
	
}

categories = cbind(categories,moneyMadeList)
categories
