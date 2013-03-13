setwd("/Users/raulfoo/Desktop")

dat = read.csv("ComprehensiveBudget.csv",stringsAsFactors=F)
dat= dat[,-c(1,3,7,8,11,12)]

dat = dat[-(which(dat[,3]==0)),]
dat = dat[is.na(dat[,3])==F,]

newID = c(1:dim(dat)[1])
dat[,3] = newID

dat = dat[,c(1:6)]

#subfunctions
subfunction = unique(dat[,5])

columns = c(5,1,2,3)
#columns = c(3,2,1,5)
output = c()



for(i in unique(dat[,5])){
	subFunctionDat = dat[which(dat[,5]==i),]
	output = c(output,i)
	for(j in unique(subFunctionDat[,1])){
		
		agencyDat = subFunctionDat[which(subFunctionDat[,1]==j),]
		#output = c(output,paste(i,paste(j,"(Total)"),sep="-->"))
		#output = c(output,paste(i,paste(j,"(List)"),sep="-->"))
		for(k in unique(agencyDat[,2])){
			
			bDat = agencyDat[which(agencyDat[,2]==k),]
			mandatories = agencyDat[which(agencyDat[,2]==k),6]
			#output = c(output,paste(i,j,paste(k,"(Total)"),sep="-->"))
			#output = c(output,paste(i,j,paste(k,"(List)"),sep="-->"))
			index=1
			for(z in bDat[,4]){
				
				zString = paste(z," (",mandatories[index],")",sep="")
				output = c(output,paste(i,j,k,zString,sep="-->"))
			}
		}
		
	}
}



id = c()



for(i in unique(dat[,5])){
	subFunctionDat = dat[which(dat[,5]==i),]
	thisID = paste(subFunctionDat[,3],collapse=",")
	id = rbind(id,paste("All",paste(thisID,collapse=","),sep=","))
	
	for(j in unique(subFunctionDat[,1])){
		agencyDat = subFunctionDat[which(subFunctionDat[,1]==j),]
		thisID = paste(agencyDat[,3],collapse=",")
		id = rbind(id,paste("All",paste(thisID,collapse=","),sep=","))
		id = rbind(id,paste(thisID,collapse=","))
	
		for(k in unique(agencyDat[,2])){
			bDat = agencyDat[which(agencyDat[,2]==k),]
			thisID = bDat[,3]
			id = rbind(id,paste("All",paste(thisID,collapse=","),sep=","))
			id = rbind(id,paste(thisID,collapse=","))
			mandatories = agencyDat[which(agencyDat[,2]==k),6]
	
			index=1
			for(z in bDat[,4]){
				thisID = bDat[index,3]
				id = rbind(id,paste(thisID,collapse=","))
				index = index+1				
	
			}
		}
		
	}
}


finalOut = cbind(output,id)



write.table(finalOut,"BudgetUs_Search.txt",sep=",",col.names=F,row.names=F)